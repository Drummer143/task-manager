defmodule Chat.Messages do
  import Ecto.Query, warn: false
  require Logger
  alias Chat.Repo

  alias Chat.Messages.Model, as: ChatMessageModel

  def has_more_messages_before(task_id, before_date, first_message_id) do
    ChatMessageModel
    |> where(
      [m],
      m.task_id == ^task_id and m.created_at < ^before_date and is_nil(m.deleted_at) and
        m.id != ^first_message_id
    )
    |> Repo.exists?()
  end

  def get_messages_before(task_id, before_date \\ nil, limit \\ 50) do
    query =
      from m in ChatMessageModel,
        where: m.task_id == ^task_id and is_nil(m.deleted_at),
        preload: [:sender, :pinner, :reply_target, reply_target: :sender],
        order_by: [desc: m.created_at],
        limit: ^limit

    query = if before_date, do: query |> where([m], m.created_at < ^before_date), else: query

    messages = query |> Repo.all()

    has_more =
      if not Enum.empty?(messages) do
        first_message_created_at = Enum.at(messages, -1).created_at
        first_message_id = Enum.at(messages, -1).id

        has_more_messages_before(task_id, first_message_created_at, first_message_id)
      else
        false
      end

    {messages, has_more}

    has_more =
      if not Enum.empty?(messages) do
        first_message_created_at = Enum.at(messages, -1).created_at
        first_message_id = Enum.at(messages, -1).id

        has_more_messages_before(task_id, first_message_created_at, first_message_id)
      else
        false
      end

    {messages, has_more}
  end

  def has_more_messages_after(task_id, after_date, last_message_id) do
    ChatMessageModel
    |> where(
      [m],
      m.task_id == ^task_id and m.created_at > ^after_date and is_nil(m.deleted_at) and
        m.id != ^last_message_id
    )
    |> Repo.exists?()
  end

  def get_messages_after(task_id, after_date, limit \\ 50) do
    messages =
      ChatMessageModel
      |> where([m], m.task_id == ^task_id and is_nil(m.deleted_at) and m.created_at > ^after_date)
      |> limit(^limit)
      |> preload([:sender, :pinner, :reply_target, reply_target: :sender])
      |> order_by([m], asc: m.created_at)
      |> Repo.all()

    has_more =
      if not Enum.empty?(messages) do
        last_message_created_at = Enum.at(messages, 0).created_at
        last_message_id = Enum.at(messages, 0).id

        has_more_messages_after(task_id, last_message_created_at, last_message_id)
      else
        false
      end

    {messages, has_more}
  end

  def count_total_messages_in_chat(task_id) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and is_nil(m.deleted_at))
    |> select([m], count(m.id))
    |> Repo.one()
  end

  def get_chat_messages_around(task_id, message_id, limit \\ 50) do
    target_message = get_message_by_id(message_id)
    limit = div(limit, 2)

    base_query =
      from u in ChatMessageModel,
        where: u.task_id == ^task_id and is_nil(u.deleted_at),
        preload: [:sender, :pinner, :reply_target, reply_target: :sender],
        limit: ^limit

    messages_before =
      base_query
      |> where([u], u.created_at < ^target_message.created_at)
      |> order_by([u], desc: u.created_at)
      |> Repo.all()

    messages_after =
      base_query
      |> where([u], u.created_at > ^target_message.created_at)
      |> order_by([u], asc: u.created_at)
      |> Repo.all()

    has_more_on_top =
      if not Enum.empty?(messages_before) do
        has_more_messages_before(task_id, target_message.created_at, target_message.id)
      else
        false
      end

    has_more_on_bottom =
      if not Enum.empty?(messages_after) do
        has_more_messages_after(task_id, target_message.created_at, target_message.id)
      else
        false
      end

    {messages_before, target_message, messages_after, has_more_on_top, has_more_on_bottom}
  end

  def count_messages_before(task_id, before_date) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and m.created_at < ^before_date and is_nil(m.deleted_at))
    |> select([m], count(m.id))
    |> Repo.one()
  end

  def create_message(task_id, user_id, text, reply_to \\ nil) do
    ChatMessageModel.changeset(%ChatMessageModel{}, %{
      task_id: task_id,
      user_id: user_id,
      text: text,
      reply_to: reply_to
    })
    |> Repo.insert(returning: true)
  end

  def get_message_by_id(id) do
    ChatMessageModel
    |> where([m], m.id == ^id)
    |> preload([:sender, :pinner, :reply_target, reply_target: :sender])
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
      pinned_by: if(is_nil(message.pinned_by), do: user_id, else: nil)
    })
    |> Repo.update()
  end

  def get_pinned_messages(task_id) do
    ChatMessageModel
    |> where([m], m.task_id == ^task_id and not is_nil(m.pinned_by))
    |> preload([:pinner, :sender, :reply_target, reply_target: :sender])
    |> order_by([m], desc: m.created_at)
    |> Repo.all()
  end
end
