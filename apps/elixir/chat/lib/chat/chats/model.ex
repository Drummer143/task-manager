defmodule Chat.Chats.Model do
  use Ecto.Schema

  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :task_id, :created_at]}

  schema "task_chats" do
    field :task_id, :binary_id
    field :created_at, :utc_datetime_usec
  end

  def changeset(chat, attrs) do
    chat
    |> cast(attrs, [:task_id])
    |> validate_required([:task_id])
  end
end
