defmodule Chat.Messages.Model do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :text, :created_at, :updated_at, :pinner, :sender]}

  schema "task_chat_messages" do
    field :text, :string
    field :task_id, :binary_id
    field :reply_to, :binary_id
    field :created_at, :utc_datetime_usec
    field :updated_at, :utc_datetime_usec
    field :deleted_at, :utc_datetime_usec

    belongs_to :sender, Chat.Users.Model, foreign_key: :user_id, type: :binary_id
    belongs_to :pinner, Chat.Users.Model, foreign_key: :pinned_by, type: :binary_id
  end

  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:text, :pinned_by, :user_id, :task_id, :reply_to, :updated_at])
    |> validate_required([:text, :user_id, :task_id])
  end
end
