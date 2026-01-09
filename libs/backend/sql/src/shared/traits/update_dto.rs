pub trait UpdateDto {
    type Model;

    fn is_empty(&self) -> bool {
        false
    }

    fn has_changes(&self, model: &Self::Model) -> bool;
}
