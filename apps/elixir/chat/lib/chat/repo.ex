defmodule Chat.Repo do
  use Ecto.Repo,
    otp_app: :chat,
    adapter: Ecto.Adapters.Postgres

  alias Chat.Models.{ChatMessageModel, UserModel}

  import Ecto.Query

  def get_chat_messages_by_task_id(task_id, pagination_params \\ %{}) do
    before = Map.get(pagination_params, "before")
    after_ = Map.get(pagination_params, "after")
    limit = Map.get(pagination_params, "limit")

    query =
      ChatMessageModel
      # |> where([m], m.task_id == ^task_id and is_nil(m.deleted_at))
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
      |> order_by([m], desc: m.created_at)

    query = if limit > 0, do: query |> limit(^limit), else: query
    query = if before, do: query |> where([m], m.created_at < ^before), else: query
    query = if after_, do: query |> where([m], m.created_at > ^after_), else: query

    query |> all()
  end

  def create_message(task_id, user_id, text) do
    ChatMessageModel.changeset(%ChatMessageModel{}, %{
      task_id: task_id,
      user_id: user_id,
      text: text
    })
    |> insert(returning: true)
  end

  def get_user_by_id(id) do
    UserModel
    |> where([u], u.id == ^id)
    |> select([u], %{
      id: u.id,
      username: u.username,
      avatar: u.picture
    })
    |> one()
  end

  def get_message_by_id(id) do
    ChatMessageModel
    |> where([m], m.id == ^id)
    |> one()
  end

  def update_message(id, text) do
    get_message_by_id(id)
    |> ChatMessageModel.changeset(%{text: text, updated_at: DateTime.utc_now()})
    |> update()
  end

  def delete_message(id) do
    from(m in ChatMessageModel, where: m.id == ^id)
    |> delete_all()
  end
end
