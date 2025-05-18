use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub email: String,
    pub username: String,
    pub picture: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserDto {
    pub email: Option<String>,
    pub username: Option<String>,
    pub picture: Option<String>,
}

impl crate::shared::traits::IsEmpty for UpdateUserDto {
    fn is_empty(&self) -> bool {
        self.email.is_none() && self.username.is_none() && self.picture.is_none()
    }
}
