use crate::{
    models::user::{User, UserFilterBy, UserSortBy},
    shared::traits::{IsEmpty, IsValid},
    types::pagination::SortOrder,
};
use sqlx::{PgPool, Postgres};
use uuid::Uuid;

pub struct UserRepository<'a> {
    pub db: &'a PgPool,
}

fn apply_filter<'a>(
    mut builder: sqlx::QueryBuilder<'a, Postgres>,
    filter: &'a UserFilterBy,
) -> sqlx::QueryBuilder<'a, Postgres> {
    builder.push(" WHERE ");

    if let Some(query) = &filter.query {
        builder
            .push("email ILIKE ")
            .push_bind(format!("%{}%", query))
            .push(" OR username ILIKE ")
            .push_bind(format!("%{}%", query));
    } else {
        let mut is_first = true;

        if let Some(email) = &filter.email {
            builder.push("(email = ").push_bind(email);
            is_first = false;
        }

        if let Some(username) = &filter.username {
            builder.push(if is_first { "(" } else { " AND " });
            builder.push("username = ").push_bind(username);
        }

        builder.push(")");
    }

    builder
}

impl<'a> UserRepository<'a> {
    pub fn new(db: &'a PgPool) -> Self {
        Self { db }
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(self.db)
            .await?;

        Ok(user)
    }

    pub async fn get_list(
        &self,
        limit: i64,
        offset: i64,
        filter: Option<UserFilterBy>,
        sort_by: Option<UserSortBy>,
        sort_order: Option<SortOrder>,
    ) -> Result<(Vec<User>, i64), sqlx::Error> {
        let mut query_builder = sqlx::QueryBuilder::<Postgres>::new("SELECT * FROM users");
        let mut total_builder = sqlx::QueryBuilder::<Postgres>::new("SELECT COUNT(*) FROM users");

        if let Some(ref filter) = filter {
            if !filter.is_empty() && filter.is_valid() {
                query_builder = apply_filter(query_builder, filter);
                total_builder = apply_filter(total_builder, filter);
            }
        }

        query_builder.push(format!(
            " ORDER BY {} {} LIMIT {} OFFSET {}",
            sort_by.unwrap_or(UserSortBy::CreatedAt),
            sort_order.unwrap_or(SortOrder::Asc),
            limit,
            offset
        ));

        let users = query_builder
            .build_query_as::<User>()
            .fetch_all(self.db)
            .await?;

        let total = total_builder
            .build_query_scalar::<i64>()
            .fetch_one(self.db)
            .await?;

        Ok((users, total))
    }

    pub async fn create(
        &self,
        user: &crate::dto::user::CreateUserDto,
    ) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users (email, username, picture) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(&user.email)
        .bind(&user.username)
        .bind(&user.picture)
        .fetch_one(self.db)
        .await?;

        Ok(user)
    }

    pub async fn update(
        &self,
        user_id: Uuid,
        user: &crate::dto::user::UpdateUserDto,
    ) -> Result<User, sqlx::Error> {
        let mut builder = sqlx::QueryBuilder::<Postgres>::new("UPDATE users SET");

        let mut separated = builder.separated(", ");

        if let Some(email) = &user.email {
            separated.push("email = ").push_bind(email);
        }

        if let Some(username) = &user.username {
            separated.push("username = ").push_bind(username);
        }

        if let Some(picture) = &user.picture {
            separated.push("picture = ").push_bind(picture);
        }

        builder
            .push(" WHERE id = ")
            .push_bind(user_id)
            .push(" RETURNING *");

        let user = builder.build_query_as::<User>().fetch_one(self.db).await?;

        Ok(user)
    }

    pub async fn delete(&self, id: Uuid) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>("DELETE FROM users WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(self.db)
            .await?;

        Ok(user)
    }
}
