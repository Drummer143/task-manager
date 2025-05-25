use chrono::Utc;
use jsonwebtoken::{encode, errors::Result, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

pub fn create_jwt(user_id: &Uuid, secret: &[u8]) -> Result<String> {
    let now = Utc::now();
    let exp = now + std::time::Duration::from_secs(24 * 7 * 60 * 60);

    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: exp.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret),
    )?;

    Ok(token)
}

pub fn decode_jwt(token: &str, secret: &[u8]) -> Result<Uuid> {
    let decoded = jsonwebtoken::decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &Validation::new(Algorithm::HS256),
    )?;
    Ok(decoded.claims.sub.parse().unwrap())
}

