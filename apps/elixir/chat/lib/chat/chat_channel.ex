defmodule Chat.ChatChannel do
  use Phoenix.Channel

  def join("chat:" <> chat_id, %{"user_id" => user_id}, socket) do
    socket = assign(socket, :user_id, user_id)

    {:ok, assign(socket, :chat_id, chat_id)}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{
      user_id: socket.assigns.user_id,
      body: body,
      chat_id: socket.assigns.chat_id
    })

    {:noreply, socket}
  end
end
