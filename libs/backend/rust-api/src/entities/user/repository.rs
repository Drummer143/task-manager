use crate::shared::types::SortOrder;
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
    }

    builder
}

pub async fn find_by_id<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    id: Uuid,
) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(executor)
        .await?;

    Ok(user)
}

pub async fn find_by_email<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    email: &str,
) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(executor)
        .await?;

    Ok(user)
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

pub async fn create<'a>(
    executor: impl sqlx::Executor<'_, Database = Postgres>,
    user: super::dto::CreateUserDto,
) -> Result<User, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, username, picture) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(&user.email)
    .bind(&user.username)
    .bind(&user.picture)
    .fetch_one(executor)
    .await?;

    Ok(user)
}

// pub async fn update<'a>(
//     executor: impl sqlx::Executor<'a, Database = Postgres>,
//     user_id: Uuid,
//     user: &super::dto::UpdateUserDto,
// ) -> Result<User, sqlx::Error> {
//     let mut builder = sqlx::QueryBuilder::<Postgres>::new("UPDATE users SET");

//     let mut separated = builder.separated(", ");

//     if let Some(email) = &user.email {
//         separated.push("email = ").push_bind(email);
//     }

//     if let Some(username) = &user.username {
//         separated.push("username = ").push_bind(username);
//     }

//     if let Some(picture) = &user.picture {
//         separated.push("picture = ").push_bind(picture);
//     }

//     builder
//         .push(" WHERE id = ")
//         .push_bind(user_id)
//         .push(" RETURNING *");

//     let user = builder.build_query_as::<User>().fetch_one(executor).await?;

//     Ok(user)
// }

// pub async fn delete(&self, id: Uuid) -> Result<User, sqlx::Error> {
//     let user = sqlx::query_as::<_, User>("DELETE FROM users WHERE id = $1 RETURNING *")
//         .bind(id)
//         .fetch_one(self.db)
//         .await?;

//     Ok(user)
// }
