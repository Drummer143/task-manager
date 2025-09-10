defmodule Chat.ChatChannel do
  use Phoenix.Channel

  def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
    socket = assign(socket, :user_id, user_id)

    {:ok, assign(socket, :chat_id, chat_id)}
  end

  def handle_in("get_all", _params, socket) do
    try do
      messages = Chat.Repo.get_chat_messages_by_task_id(socket.assigns.chat_id)

      {:reply, {:ok, messages}, socket}
    rescue
      e -> {:reply, {:error, e}, socket}
    end
  end

  import Ecto.Query, only: [from: 2]

  def handle_in("create", %{"text" => text}, socket) do
    task_id = socket.assigns.chat_id
    user_id = socket.assigns.user_id

    case Chat.Repo.create_message(task_id, user_id, text) do
      {:ok, message} ->
        # Подгружаем пользователя
        sender_query =
          from u in Chat.Models.UserModel,
            where: u.id == ^user_id,
            select: %{
              id: u.id,
              email: u.email,
              username: u.username,
              picture: u.picture
            }

        sender = Chat.Repo.one(sender_query)

        payload = %{
          id: message.id,
          text: message.text,
          taskId: message.task_id,
          createdAt: message.created_at,
          updatedAt: message.updated_at,
          sender: sender
        }

        broadcast!(socket, "new", payload)
        {:noreply, socket}

      {:error, changeset} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end
end
