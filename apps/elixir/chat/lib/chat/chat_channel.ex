defmodule Chat.ChatChannel do
  use Phoenix.Channel
  alias Chat.Presence

  import Ecto.Query, only: [from: 2]

  def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
    case Chat.Repo.get_user_by_id(user_id) do
      nil ->
        {:error, %{reason: "User not found"}}

      user ->
        socket =
          socket
          |> assign(:user, user)
          |> assign(:chat_id, chat_id)

        send(self(), "after_join")

        {:ok, socket}
    end
  end

  def handle_info("after_join", socket) do
    Presence.track(socket, socket.assigns.user.id, %{
      typing: false,
      username: socket.assigns.user.username,
      avatar: socket.assigns.user.avatar,
      id: socket.assigns.user.id,
      joined_at: System.system_time(:second)
    })

    push(socket, "presence_state", Presence.list(socket))

    {:noreply, socket}
  end

  def handle_info("stop_typing", socket) do
    Presence.update(socket, socket.assigns.user.id, fn meta ->
      Map.put(meta, :typing, false)
    end)

    {:noreply, assign(socket, "typing_timer_ref", nil)}
  end

  def handle_in("typing", _payload, socket) do
    Presence.update(socket, socket.assigns.user.id, fn meta ->
      Map.put(meta, :typing, true)
    end)

    if timer_ref = Map.get(socket.assigns, "typing_timer_ref") do
      Process.cancel_timer(timer_ref)
    end

    ref = Process.send_after(self(), "stop_typing", 1500)

    {:noreply, assign(socket, "typing_timer_ref", ref)}
  end

  def handle_in("get_all", params, socket) do
    try do
      messages = Chat.Repo.get_chat_messages_by_task_id(socket.assigns.chat_id, params)

      {:reply, {:ok, messages}, socket}
    rescue
      e -> {:reply, {:error, e}, socket}
    end
  end

  def handle_in("create", %{"text" => text}, socket) do
    chat_id = socket.assigns.chat_id
    user_id = socket.assigns.user.id

    case Chat.Repo.create_message(chat_id, user_id, text) do
      {:ok, message} ->
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

  def handle_in("update", %{"id" => id, "text" => text}, socket) do
    user_id = socket.assigns.user.id

    case Chat.Repo.get_message_by_id(id) do
      nil ->
        {:reply, {:error, %{reason: "Message not found"}}, socket}

      message ->
        if message.user_id != user_id do
          {:reply, {:error, %{reason: "You can edit only your own messages"}}, socket}
        else
          case Chat.Repo.update_message(id, text) do
            {:ok, message} ->
              sender = Chat.Repo.get_user_by_id(message.user_id)

              payload = %{
                action: "edit",
                message: %{
                  id: message.id,
                  text: message.text,
                  taskId: message.task_id,
                  pinnedBy: message.pinned_by,
                  createdAt: message.created_at,
                  updatedAt: message.updated_at,
                  sender: sender
                }
              }

              broadcast!(socket, "update", payload)
              {:noreply, socket}

            {:error, _changeset} ->
              {:reply, {:error, %{reason: "Failed to update message"}}, socket}
          end
        end
    end
  end

  def handle_in("pin", %{"id" => id}, socket) do
    case Chat.Repo.toggle_pinned(id, socket.assigns.user.id) do
      {:ok, message} ->
        sender = Chat.Repo.get_user_by_id(message.user_id)
        pinned_by = if message.pinned_by, do: Chat.Repo.get_user_by_id(message.pinned_by), else: nil

        payload = %{
          action: if(message.pinned_by, do: "pin", else: "unpin"),
          message: %{
            id: message.id,
            text: message.text,
            taskId: message.task_id,
            pinnedBy: pinned_by,
            createdAt: message.created_at,
            updatedAt: message.updated_at,
            sender: sender
          }
        }

        broadcast!(socket, "update", payload)
        {:noreply, socket}

      {:error, _changeset} ->
        {:reply, {:error, %{reason: "Failed to pin message"}}, socket}
    end
  end

  def handle_in("get_pinned", _params, socket) do
    case Chat.Repo.get_pinned_messages(socket.assigns.chat_id) do
      nil ->
        {:reply, {:error, %{reason: "Task not found"}}, socket}

      pinned_messages ->
        {:reply, {:ok, pinned_messages}, socket}
    end
  end

  def handle_in("delete", %{"id" => id}, socket) do
    user_id = socket.assigns.user.id

    case Chat.Repo.get_message_by_id(id) do
      nil ->
        {:reply, {:error, %{reason: "Message not found"}}, socket}

      message ->
        if message.user_id != user_id do
          {:reply, {:error, %{reason: "You can delete only your own messages"}}, socket}
        else
          case Chat.Repo.delete_message(id) do
            {1, _} ->
              broadcast!(socket, "delete", %{id: id})
              {:noreply, socket}

            _ ->
              {:reply, {:error, %{reason: "Message not found"}}, socket}
          end
        end
    end
  end
end
