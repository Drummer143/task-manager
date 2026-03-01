pub trait UpdateDto {
    type Model;

    fn is_empty(&self) -> bool {
        false
    }
}
