defmodule SocketServer.UserSocket do
  use Phoenix.Socket

  channel("signals", SocketServer.SignalsChannel)

  def connect(_params, socket, _connect_info) do
    socket = assign(socket, :user_id, "user_id")
    {:ok, socket}
  end

  def id(socket), do: "socket:#{socket.assigns.user_id}"
end
