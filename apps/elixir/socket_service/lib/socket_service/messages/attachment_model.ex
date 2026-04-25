defmodule SocketService.Messages.AttachmentModel do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "task_chat_message_attachments" do
    field :created_at, :utc_datetime_usec

    belongs_to :message, SocketService.Messages.Model, type: :binary_id
    belongs_to :asset, SocketService.Messages.AssetModel, foreign_key: :asset_id, type: :binary_id
  end

  def changeset(attachment, attrs) do
    attachment
    |> cast(attrs, [:message_id, :asset_id])
    |> validate_required([:message_id, :asset_id])
  end
end
