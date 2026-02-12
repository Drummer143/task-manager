use blake3::Hasher;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct FileHasher {
    hasher: Hasher,
}

#[wasm_bindgen]
impl FileHasher {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            hasher: Hasher::new(),
        }
    }

    pub fn update(&mut self, data: &[u8]) {
        self.hasher.update(data);
    }

    pub fn digest(self) -> String {
        self.hasher.finalize().to_string()
    }

    // pub fn hash(input: &str) -> String {
    //     blake3::hash(input.as_bytes()).to_string()
    // }
}
