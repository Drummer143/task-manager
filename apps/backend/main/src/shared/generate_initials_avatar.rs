fn pick_color(username: &str) -> &'static str {
    const COLORS: &[&str] = &[
        "F44336", "E91E63", "9C27B0", "673AB7", "3F51B5", "2196F3", "03A9F4", "00BCD4",
        "009688", "4CAF50", "8BC34A", "FF9800", "FF5722", "795548",
    ];
    let hash: usize = username
        .bytes()
        .fold(0usize, |acc, b| acc.wrapping_add(b as usize));
    COLORS[hash % COLORS.len()]
}

pub async fn fetch_png_avatar(username: &str) -> Result<Vec<u8>, reqwest::Error> {
    let color = pick_color(username);
    let bytes = reqwest::Client::new()
        .get("https://api.dicebear.com/9.x/initials/png")
        .query(&[
            ("seed", username),
            ("size", "128"),
            ("backgroundColor", color),
        ])
        .send()
        .await?
        .bytes()
        .await?;
    Ok(bytes.to_vec())
}
