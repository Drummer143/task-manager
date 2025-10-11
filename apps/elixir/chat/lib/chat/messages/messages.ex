defmodule Chat.Messages do
  import Ecto.Query, warn: false
  alias Chat.Repo

  alias Chat.Messages.Model, as: ChatMessageModel

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
    |> Repo.all()
  end

  def create_message(task_id, user_id, text) do
    ChatMessageModel.changeset(%ChatMessageModel{}, %{
      task_id: task_id,
      user_id: user_id,
      text: text
    })
    |> Repo.insert(returning: true)
  end

  def get_message_by_id(id) do
    ChatMessageModel
    |> where([m], m.id == ^id)
    |> Repo.one()
  end

  def update_message(id, text) do
    get_message_by_id(id)
    |> ChatMessageModel.changeset(%{text: text, updated_at: DateTime.utc_now()})
    |> Repo.update()
  end

  def delete_message(id) do
    from(m in ChatMessageModel, where: m.id == ^id)
    |> Repo.delete_all()
  end

  def toggle_pinned(message_id, user_id) do
    message = get_message_by_id(message_id)

    message
    |> ChatMessageModel.changeset(%{
      pinned_by: if(message.pinned_by == nil, do: user_id, else: nil)
    })
    |> Repo.update()
  end

  def get_pinned_messages(task_id) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and not is_nil(m.pinned_by))
    |> preload([:pinner, :sender])
    |> order_by([m], desc: m.created_at)
    |> Repo.all()
  end
end
