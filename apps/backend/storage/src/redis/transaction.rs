use std::sync::Arc;

use deadpool_redis::redis::AsyncCommands;
use uuid::Uuid;

use super::error::RedisError;

/// Default TTL: 3 days in seconds
const DEFAULT_TTL_SECONDS: u64 = 3 * 24 * 60 * 60;

/// TTL for active uploads counter: 1 minute
pub const ACTIVE_UPLOADS_TTL_SECONDS: u64 = 60;

/// Max concurrent chunk uploads per transaction
pub const MAX_CONCURRENT_UPLOADS: u64 = 5;

/// Chunk size: 5MB
pub const CHUNK_SIZE: u64 = 5 * 1024 * 1024;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TransactionMeta {
    pub hash: String,
    pub size: u64,
    pub total_chunks: u64,
    pub transaction_type: TransactionType,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TransactionType {
    ChunkedUpload { path_to_file: String },
    WholeFileUpload { path_to_file: String },
    VerifyRanges { ranges: Vec<VerifyRange> },
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VerifyRange {
    pub start: i64,
    pub end: i64,
}

pub struct TransactionRepository;

impl TransactionRepository {
    /// Generates key for transaction metadata
    fn meta_key(transaction_id: Uuid) -> String {
        format!("tx:{}:meta", transaction_id)
    }

    /// Generates key for uploaded chunks bitmap
    fn chunks_key(transaction_id: Uuid) -> String {
        format!("tx:{}:chunks", transaction_id)
    }

    /// Generates key for active uploads counter
    fn active_uploads_key(transaction_id: Uuid) -> String {
        format!("tx:{}:active", transaction_id)
    }

    /// Creates a new upload transaction
    pub async fn create(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
        hash: String,
        size: u64,
        transaction_type: TransactionType,
    ) -> Result<TransactionMeta, RedisError> {
        let mut conn = pool.get().await?;

        let total_chunks = (size + CHUNK_SIZE - 1) / CHUNK_SIZE; // ceil division

        let meta = TransactionMeta {
            hash,
            size,
            total_chunks,
            transaction_type,
        };

        let meta_json = serde_json::to_string(&meta)?;
        let key = Self::meta_key(transaction_id);

        conn.set_ex::<_, _, ()>(&key, &meta_json, DEFAULT_TTL_SECONDS)
            .await?;

        Ok(meta)
    }

    /// Retrieves transaction metadata
    pub async fn get(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<TransactionMeta, RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::meta_key(transaction_id);

        let meta_json: Option<String> = conn.get(&key).await?;

        match meta_json {
            Some(json) => Ok(serde_json::from_str(&json)?),
            None => Err(RedisError::NotFound),
        }
    }

    /// Deletes transaction (metadata + chunks bitmap + active counter)
    pub async fn delete(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<(), RedisError> {
        let mut conn = pool.get().await?;

        let meta_key = Self::meta_key(transaction_id);
        let chunks_key = Self::chunks_key(transaction_id);
        let active_key = Self::active_uploads_key(transaction_id);

        conn.del::<_, ()>(&[&meta_key, &chunks_key, &active_key]).await?;

        Ok(())
    }

    /// Tries to acquire upload slot. Returns Ok(true) if acquired, Ok(false) if limit reached.
    pub async fn try_acquire_upload_slot(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<bool, RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::active_uploads_key(transaction_id);

        // INCR and check if within limit
        let count: u64 = conn.incr(&key, 1).await?;

        // Set TTL on first increment (or refresh)
        conn.expire::<_, ()>(&key, ACTIVE_UPLOADS_TTL_SECONDS as i64).await?;

        if count > MAX_CONCURRENT_UPLOADS {
            // Over limit - decrement and reject
            conn.decr::<_, _, ()>(&key, 1).await?;
            Ok(false)
        } else {
            Ok(true)
        }
    }

    /// Releases upload slot after chunk upload completes
    pub async fn release_upload_slot(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<(), RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::active_uploads_key(transaction_id);

        // Decrement, but don't go below 0
        let count: i64 = conn.decr(&key, 1).await?;
        if count < 0 {
            conn.set::<_, _, ()>(&key, 0).await?;
        }

        Ok(())
    }

    /// Marks chunk as uploaded (sets bit in bitmap)
    pub async fn set_chunk_uploaded(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
        chunk_index: u64,
    ) -> Result<(), RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::chunks_key(transaction_id);

        // SETBIT returns the previous bit value
        conn.setbit::<_, ()>(&key, chunk_index as usize, true)
            .await?;

        // Refresh TTL for bitmap
        conn.expire::<_, ()>(&key, DEFAULT_TTL_SECONDS as i64)
            .await?;

        Ok(())
    }

    /// Checks if a specific chunk is uploaded
    pub async fn is_chunk_uploaded(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
        chunk_index: u64,
    ) -> Result<bool, RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::chunks_key(transaction_id);

        let bit: bool = conn.getbit(&key, chunk_index as usize).await?;

        Ok(bit)
    }

    /// Returns the count of uploaded chunks
    pub async fn get_uploaded_chunks_count(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<u64, RedisError> {
        let mut conn = pool.get().await?;
        let key = Self::chunks_key(transaction_id);

        let count: u64 = conn.bitcount(&key).await?;

        Ok(count)
    }

    /// Checks if all chunks are uploaded
    pub async fn is_upload_complete(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<bool, RedisError> {
        let meta = Self::get(pool, transaction_id).await?;
        let uploaded = Self::get_uploaded_chunks_count(pool, transaction_id).await?;

        Ok(uploaded >= meta.total_chunks)
    }

    /// Returns the index of the first missing chunk (or None if all uploaded)
    pub async fn get_first_missing_chunk(
        pool: &Arc<deadpool_redis::Pool>,
        transaction_id: Uuid,
    ) -> Result<Option<u64>, RedisError> {
        let mut conn = pool.get().await?;
        let meta = Self::get(pool, transaction_id).await?;
        let key = Self::chunks_key(transaction_id);

        // BITPOS finds the first bit with the specified value
        // Returns -1 if not found
        let pos: i64 = deadpool_redis::redis::cmd("BITPOS")
            .arg(&key)
            .arg(0)
            .query_async(&mut *conn)
            .await?;

        if pos < 0 || pos as u64 >= meta.total_chunks {
            Ok(None)
        } else {
            Ok(Some(pos as u64))
        }
    }

    /// Calculates chunk index from byte offset
    pub fn chunk_index_from_offset(offset: u64) -> u64 {
        offset / CHUNK_SIZE
    }

    /// Calculates expected byte range for a chunk
    pub fn chunk_byte_range(chunk_index: u64, file_size: u64) -> (u64, u64) {
        let start = chunk_index * CHUNK_SIZE;
        let end = std::cmp::min(start + CHUNK_SIZE, file_size);
        (start, end)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunk_index_from_offset() {
        assert_eq!(TransactionRepository::chunk_index_from_offset(0), 0);
        assert_eq!(
            TransactionRepository::chunk_index_from_offset(5 * 1024 * 1024 - 1),
            0
        );
        assert_eq!(
            TransactionRepository::chunk_index_from_offset(5 * 1024 * 1024),
            1
        );
        assert_eq!(
            TransactionRepository::chunk_index_from_offset(10 * 1024 * 1024),
            2
        );
    }

    #[test]
    fn test_chunk_byte_range() {
        let file_size = 12 * 1024 * 1024; // 12MB = 3 chunks (5, 5, 2)

        assert_eq!(
            TransactionRepository::chunk_byte_range(0, file_size),
            (0, 5 * 1024 * 1024)
        );
        assert_eq!(
            TransactionRepository::chunk_byte_range(1, file_size),
            (5 * 1024 * 1024, 10 * 1024 * 1024)
        );
        assert_eq!(
            TransactionRepository::chunk_byte_range(2, file_size),
            (10 * 1024 * 1024, 12 * 1024 * 1024)
        );
    }
}
