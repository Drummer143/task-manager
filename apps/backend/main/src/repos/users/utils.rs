use sqlx::Postgres;

use crate::repos::users::dto::UserFilterBy;

pub fn apply_filter<'a>(
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

        if let Some(ref exclude) = filter.exclude
            && !exclude.is_empty()
        {
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

        builder.push(")");
    }

    builder
}
