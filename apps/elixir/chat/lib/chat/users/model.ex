defmodule Chat.Users.Model do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :email, :username, :picture]}

  schema "users" do
    field :email, :string
    field :username, :string
    field :picture, :string
    field :created_at, :utc_datetime_usec
    field :updated_at, :utc_datetime_usec
    field :deleted_at, :utc_datetime_usec
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :username, :picture])
    |> validate_required([:email, :username])
  end
end
