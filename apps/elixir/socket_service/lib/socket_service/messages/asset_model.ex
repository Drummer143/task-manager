defmodule SocketService.Messages.AssetModel do
  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "assets" do
    field :name, :string
    field :blob_id, :binary_id
    field :entity_id, :binary_id
    field :entity_type, :string
    field :created_at, :utc_datetime_usec
    field :updated_at, :utc_datetime_usec
  end
end
