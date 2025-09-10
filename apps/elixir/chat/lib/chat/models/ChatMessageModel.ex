defmodule Chat.Models.ChatMessageModel do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :text, :created_at, :updated_at]}

  schema "task_chat_messages" do
    field :text, :string
    field :user_id, :binary_id
    field :task_id, :binary_id
    field :created_at, :utc_datetime
    field :updated_at, :utc_datetime
    field :deleted_at, :utc_datetime
  end

  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:text, :user_id, :task_id])
    |> validate_required([:text, :user_id, :task_id])
  end
end
