pub fn deserialize_comma_separated_query_param<'de, D, T: std::str::FromStr>(
    deserializer: D,
) -> Result<Option<Vec<T>>, D::Error>
where
    D: serde::de::Deserializer<'de>,
{
    use serde::Deserialize;

    let s = String::deserialize(deserializer)?;
    if s.trim().is_empty() {
        return Ok(Some(vec![]));
    }

    let mut result = Vec::new();

    for part in s.split(',') {
        let trimmed = part.trim();

        match T::from_str(trimmed) {
            Ok(uuid) => result.push(uuid),
            Err(_) => {
                return Err(serde::de::Error::custom(format!(
                    "Invalid UUID: '{}'",
                    trimmed
                )))
            }
        }
    }

    Ok(Some(result))
}
