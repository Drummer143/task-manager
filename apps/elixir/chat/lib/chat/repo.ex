defmodule Chat.Repo do
  use Ecto.Repo,
    otp_app: :chat,
    adapter: Ecto.Adapters.Postgres

  alias Chat.Models.{ChatMessageModel, UserModel}

  import Ecto.Query

  def get_chat_messages_by_task_id(task_id, pagination_params \\ %{}) do
    before_date = Map.get(pagination_params, "before")
    after_date = Map.get(pagination_params, "after")
    limit = Map.get(pagination_params, "limit")

    query =
      from m in ChatMessageModel,
        where: m.task_id == ^task_id and is_nil(m.deleted_at),
        preload: [:sender, :pinner],
        order_by: [desc: m.created_at]

    query = if limit > 0, do: query |> limit(^limit), else: query
    query = if before_date, do: query |> where([m], m.created_at < ^before_date), else: query
    query = if after_date, do: query |> where([m], m.created_at > ^after_date), else: query

    query
    |> all()
    |> Enum.map(fn message ->
      %{
        id: message.id,
        text: message.text,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
        pinnedBy:
          if(is_nil(message.pinner),
            do: nil,
            else: %{
              id: message.pinner.id,
              username: message.pinner.username,
              avatar: message.pinner.picture
            }
          ),
        sender: %{
          id: message.sender.id,
          username: message.sender.username,
          avatar: message.sender.picture
        }
      }
    end)
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

  def toggle_pinned(message_id, user_id) do
    message = get_message_by_id(message_id)

    message
    |> ChatMessageModel.changeset(%{
      pinned_by: if(message.pinned_by == nil, do: user_id, else: nil)
    })
    |> update()
  end

  def get_pinned_messages(task_id) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and not is_nil(m.pinned_by))
    |> join(:inner, [m], u in UserModel, on: m.user_id == u.id)
    |> select([m, u], %{
      id: m.id,
      text: m.text,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      pinned_by: %{
        id: m.pinned_by,
        username: u.username,
        avatar: u.picture
      },
      reply_to: m.reply_to,
      sender: %{
        id: u.id,
        username: u.username,
        avatar: u.picture
      }
    })
    |> order_by([m], desc: m.created_at)
    |> all()
  end
end
