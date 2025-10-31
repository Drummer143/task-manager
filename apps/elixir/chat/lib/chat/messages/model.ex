defmodule Chat.Messages.Model do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :text, :created_at, :updated_at, :pinner, :sender, :reply_target]}

  schema "task_chat_messages" do
    field :text, :string
    field :chat_id, :binary_id
    field :created_at, :utc_datetime_usec
    field :updated_at, :utc_datetime_usec
    field :deleted_at, :utc_datetime_usec

    belongs_to :sender, Chat.Users.Model, foreign_key: :user_id, type: :binary_id
    belongs_to :pinner, Chat.Users.Model, foreign_key: :pinned_by, type: :binary_id
    belongs_to :reply_target, Chat.Messages.Model, foreign_key: :reply_to, type: :binary_id
  end

  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:text, :pinned_by, :user_id, :chat_id, :reply_to, :updated_at])
    |> validate_required([:text, :user_id, :chat_id])
  end
end
