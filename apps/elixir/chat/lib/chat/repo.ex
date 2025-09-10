defmodule Chat.Repo do
  use Ecto.Repo,
    otp_app: :chat,
    adapter: Ecto.Adapters.Postgres

  alias Chat.Models.{ChatMessageModel, UserModel}

  import Ecto.Query

  def get_chat_messages_by_task_id(task_id) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and is_nil(m.deleted_at))
    |> join(:inner, [m], u in UserModel, on: m.user_id == u.id)
    |> select([m, u], %{
      id: m.id,
      text: m.text,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      sender: %{
        id: u.id,
        username: u.username,
        avatar: u.picture
      }
    })
    |> order_by([m], asc: m.created_at)
    |> all()
  end

  def create_message(task_id, user_id, text) do
    ChatMessageModel.changeset(%ChatMessageModel{}, %{
      task_id: task_id,
      user_id: user_id,
      text: text
    })
    |> insert(returning: true)
  end
end
