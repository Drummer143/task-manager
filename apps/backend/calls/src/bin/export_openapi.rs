use std::io::Write;
use std::path::Path;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    let out_path = args
        .get(1)
        .cloned()
        .unwrap_or_else(|| "libs/frontend/api/specs/openapi-calls.json".to_string());

    let json = calls_app::openapi_json();

    if let Some(parent) = Path::new(&out_path).parent() {
        std::fs::create_dir_all(parent).expect("Failed to create output directory");
    }

    let mut file = std::fs::File::create(&out_path).expect("Failed to create output file");
    file.write_all(json.as_bytes())
        .expect("Failed to write OpenAPI JSON");

    println!("OpenAPI spec written to {}", out_path);
}
