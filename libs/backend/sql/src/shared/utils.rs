pub fn calculate_limit(limit: Option<i64>) -> i64 {
    use crate::shared::constants::DEFAULT_LIMIT;

    let limit = limit.unwrap_or(DEFAULT_LIMIT);

    if limit > 100 {
        return 100;
    }

    if limit == 0 {
        return DEFAULT_LIMIT;
    }

    limit
}
