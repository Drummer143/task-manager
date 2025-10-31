defmodule Chat.Users do
  import Ecto.Query, warn: false
  alias Chat.Repo

  alias Chat.Users.Model, as: UserModel

  def get_user_by_id(id) do
    UserModel
    |> where([u], u.id == ^id)
    |> select([u], %{
      id: u.id,
      username: u.username,
      avatar: u.picture
    })
    |> Repo.one()
  end
end
