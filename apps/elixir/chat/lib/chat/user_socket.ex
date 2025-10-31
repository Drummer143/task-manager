defmodule Chat.UserSocket do
  require Logger
  use Phoenix.Socket

  channel "chat:*", Chat.ChatChannel

  def connect(_params, socket, _connect_info) do
    socket = assign(socket, :user_id, "user_id")
    {:ok, socket}
  end

  def id(socket), do: "socket:#{socket.assigns.user_id}"
end
