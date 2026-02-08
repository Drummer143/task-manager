defmodule SocketService.ChatChannel do
  use Phoenix.Channel
  alias SocketService.Presence

  def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
    case SocketService.Users.get_user_by_id(user_id) do
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

  def handle_in("get_all", %{"after" => after_date} = params, socket) do
    try do
      limit = Map.get(params, "limit", 50)
      count_total = Map.get(params, "countTotal", false)

      {messages, has_more} =
        SocketService.Messages.get_messages_after(
          socket.assigns.chat_id,
          after_date,
          limit
        )

      total =
        if count_total do
          SocketService.Messages.count_total_messages_in_chat(socket.assigns.chat_id)
        else
          nil
        end

      messages = Enum.map(messages, &SocketService.Messages.Mappers.to_response/1)

      {:reply,
       {:ok,
        %{
          messages: messages,
          total: total,
          hasMoreOnBottom: has_more
        }}, socket}
    rescue
      e -> {:reply, {:error, e}, socket}
    end
  end

  def handle_in("get_all", params, socket) do
    try do
      limit = Map.get(params, "limit", 50)
      count_total = Map.get(params, "countTotal", false)
      before_date = Map.get(params, "before")

      {messages, has_more} =
        SocketService.Messages.get_messages_before(
          socket.assigns.chat_id,
          before_date,
          limit
        )

      total =
        if count_total do
          SocketService.Messages.count_total_messages_in_chat(socket.assigns.chat_id)
        else
          nil
        end

      has_more_on_bottom =
        if is_nil(before_date) and not Enum.empty?(messages) do
          last_message = Enum.at(messages, 0)

          SocketService.Messages.has_more_messages_after(
            socket.assigns.chat_id,
            last_message.created_at,
            last_message.id
          )
        else
          nil
        end

      messages = Enum.reverse(messages) |> Enum.map(&SocketService.Messages.Mappers.to_response/1)

      {:reply,
       {:ok,
        %{
          messages: messages,
          total: total,
          hasMoreOnTop: has_more,
          hasMoreOnBottom: has_more_on_bottom
        }}, socket}
    rescue
      e -> {:reply, {:error, e}, socket}
    end
  end

  def handle_in("get_around", params, socket) do
    try do
      message_id = Map.get(params, "messageId")
      limit = Map.get(params, "limit")

      {messages_before, target_message, messages_after, has_more_on_top, has_more_on_bottom} =
        SocketService.Messages.get_chat_messages_around(socket.assigns.chat_id, message_id, limit)

      mapped_after = Enum.map(messages_after, &SocketService.Messages.Mappers.to_response/1)

      initial_acc = [SocketService.Messages.Mappers.to_response(target_message) | mapped_after]

      messages =
        Enum.reduce(messages_before, initial_acc, fn message, acc ->
          [SocketService.Messages.Mappers.to_response(message) | acc]
        end)

      target_position = length(messages_before)

      first_message_position =
        if target_position > 0 do
          first_message_created_at = Enum.at(messages, 0).createdAt

          SocketService.Messages.count_messages_before(socket.assigns.chat_id, first_message_created_at)
        else
          0
        end

      {:reply,
       {:ok,
        %{
          messages: messages,
          targetPosition: target_position,
          firstMessagePosition: first_message_position,
          hasMoreOnTop: has_more_on_top,
          hasMoreOnBottom: has_more_on_bottom
        }}, socket}
    rescue
      e -> {:reply, {:error, e}, socket}
    end
  end

  def handle_in("create", payload, socket) do
    chat_id = socket.assigns.chat_id
    user_id = socket.assigns.user.id

    text = Map.get(payload, "text")
    reply_to = Map.get(payload, "replyTo", nil)

    case SocketService.Messages.create_message(chat_id, user_id, text, reply_to) do
      {:ok, message} ->
        sender = SocketService.Users.get_user_by_id(user_id)

        payload = %{
          id: message.id,
          text: message.text,
          taskId: message.task_id,
          createdAt: message.created_at,
          updatedAt: message.updated_at,
          sender: sender,
          replyTo: message.reply_to
        }

        Presence.update(socket, user_id, fn meta ->
          Map.put(meta, :typing, false)
        end)

        broadcast!(socket, "new", payload)
        {:noreply, socket}

      {:error, changeset} ->
        {:reply, {:error, %{errors: changeset}}, socket}
    end
  end

  def handle_in("update", %{"id" => id, "text" => text}, socket) do
    user_id = socket.assigns.user.id

    case SocketService.Messages.get_message_by_id(id) do
      nil ->
        {:reply, {:error, %{reason: "Message not found"}}, socket}

      message ->
        if message.user_id != user_id do
          {:reply, {:error, %{reason: "You can edit only your own messages"}}, socket}
        else
          case SocketService.Messages.update_message(id, text) do
            {:ok, message} ->
              sender = SocketService.Users.get_user_by_id(message.user_id)

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
    case SocketService.Messages.toggle_pinned(id, socket.assigns.user.id) do
      {:ok, message} ->
        sender = SocketService.Users.get_user_by_id(message.user_id)

        pinned_by =
          if message.pinned_by, do: SocketService.Users.get_user_by_id(message.pinned_by), else: nil

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
    case SocketService.Messages.get_pinned_messages(socket.assigns.chat_id) do
      nil ->
        {:reply, {:error, %{reason: "Task not found"}}, socket}

      pinned_messages ->
        {:reply, {:ok, Enum.map(pinned_messages, &SocketService.Messages.Mappers.to_response/1)}, socket}
    end
  end

  def handle_in("delete", %{"id" => id}, socket) do
    user_id = socket.assigns.user.id

    case SocketService.Messages.get_message_by_id(id) do
      nil ->
        {:reply, {:error, %{reason: "Message not found"}}, socket}

      message ->
        if message.user_id != user_id do
          {:reply, {:error, %{reason: "You can delete only your own messages"}}, socket}
        else
          case SocketService.Messages.delete_message(id) do
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
