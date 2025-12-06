use crate::{
    entities::user::dto::UpdateUserDto,
    shared::{
        traits::{
            PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, RepositoryBase, UpdateDto,
        },
        types::SortOrder,
    },
};
use sqlx::Postgres;
use uuid::Uuid;

use super::{
    dto::{UserFilterBy, UserSortBy},
    model::User,
};

fn apply_filter<'a>(
    mut builder: sqlx::QueryBuilder<'a, Postgres>,
    filter: &'a UserFilterBy,
) -> sqlx::QueryBuilder<'a, Postgres> {
    if let Some(workspace_id) = filter.workspace_id {
        builder.push(" JOIN workspace_accesses ON users.id = workspace_accesses.user_id AND workspace_accesses.workspace_id = ").push_bind(workspace_id);
    }

    if let Some(query) = &filter.query {
        builder
            .push(" WHERE (")
            .push("users.email ILIKE ")
            .push_bind(format!("%{}%", query))
            .push(" OR users.username ILIKE ")
            .push_bind(format!("%{}%", query))
            .push(")");
    } else if filter.has_any_user_filter() {
        let mut where_started = false;

        builder.push(" WHERE (");

        if let Some(email) = &filter.email {
            builder
                .push("users.email ILIKE ")
                .push_bind(format!("%{}%", email));
            where_started = true;
        }

        if let Some(username) = &filter.username {
            if where_started {
                builder.push(" AND ");
            }
            where_started = true;
            builder
                .push("users.username ILIKE ")
                .push_bind(format!("%{}%", username));
        }

        if let Some(ref exclude) = filter.exclude {
            if !exclude.is_empty() {
                if where_started {
                    builder.push(" AND ");
                }

                builder.push("users.id NOT IN (");

                let mut separated = builder.separated(", ");
                for id in exclude {
                    separated.push_bind(id);
                }

                builder.push(")");
            }
        }

        builder.push(")");
    }

    builder
}

pub struct UserRepository;

impl RepositoryBase for UserRepository {
    type Response = User;
}

impl PostgresqlRepositoryGetOneById for UserRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await?;

        Ok(user)
    }
}

impl PostgresqlRepositoryCreate for UserRepository {
    type CreateDto = super::dto::CreateUserDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        dto: Self::CreateDto,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "INSERT INTO users (id, authentik_id, email, username, picture, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        )
        .bind(&dto.id)
        .bind(&dto.authentik_id)
        .bind(&dto.email)
        .bind(&dto.username)
        .bind(&dto.picture)
        .bind(&dto.created_at)
        .fetch_one(executor)
        .await
    }
}

impl UserRepository {
    pub async fn get_one_by_email<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        email: &str,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_one(executor)
            .await
    }

    pub async fn get_one_by_authentik_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        authentik_id: i32,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE authentik_id = $1")
            .bind(authentik_id)
            .fetch_one(executor)
            .await
    }

    pub async fn update_by_authentik_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres> + Clone,
        authentik_id: i32,
        dto: UpdateUserDto,
    ) -> Result<User, sqlx::Error> {
        let current = Self::get_one_by_authentik_id(executor.clone(), authentik_id).await?;

        if dto.is_empty() || !dto.has_changes(&current) {
            return Ok(current);
        }

        let mut query_builder = sqlx::QueryBuilder::new("UPDATE users SET ");

        let mut separated = query_builder.separated(", ");

        if let Some(email) = dto.email {
            separated.push("email = ").push_bind_unseparated(email);
        }

        if let Some(is_active) = dto.is_active {
            separated
                .push("is_active = ")
                .push_bind_unseparated(is_active);
        }

        if let Some(picture) = dto.picture {
            separated.push("picture = ").push_bind_unseparated(picture);
        }

        if let Some(username) = dto.username {
            separated
                .push("username = ")
                .push_bind_unseparated(username);
        }

        separated
            .push("updated_at = ")
            .push_bind_unseparated(chrono::Utc::now());

        query_builder
            .push(" WHERE authentik_id = ")
            .push_bind(authentik_id)
            .push(" RETURNING *")
            .build_query_as::<User>()
            .fetch_one(executor)
            .await
    }

    pub async fn delete_by_authentik_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: i32,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>("DELETE FROM users WHERE authentik_id = $1 RETURNING *")
            .bind(id)
            .fetch_one(executor)
            .await
    }

    pub async fn get_list<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres> + Copy,
        limit: i64,
        offset: i64,
        filter: Option<&UserFilterBy>,
        sort_by: Option<&UserSortBy>,
        sort_order: Option<&SortOrder>,
    ) -> Result<(Vec<User>, i64), sqlx::Error> {
        let mut query_builder = sqlx::QueryBuilder::<Postgres>::new("SELECT users.* FROM users");
        let mut total_builder =
            sqlx::QueryBuilder::<Postgres>::new("SELECT COUNT(DISTINCT users.id) FROM users");

        if let Some(filter) = filter {
            if !filter.is_empty() && filter.is_valid() {
                query_builder = apply_filter(query_builder, filter);
                total_builder = apply_filter(total_builder, filter);
            }
        }

        query_builder.push(format!(
            " ORDER BY {} {} LIMIT {} OFFSET {}",
            sort_by.unwrap_or(&UserSortBy::CreatedAt),
            sort_order.unwrap_or(&SortOrder::Asc),
            limit,
            offset
        ));

        let users = query_builder
            .build_query_as::<User>()
            .fetch_all(executor)
            .await?;

        let total = total_builder
            .build_query_scalar::<i64>()
            .fetch_one(executor)
            .await?;

        Ok((users, total))
    }
}
