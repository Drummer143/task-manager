defmodule SocketServer.SignalsChannel do
  use Phoenix.Channel

  def join("signals", _params, socket), do: {:ok, socket}

  def handle_in("new_signal", payload, socket) do
    broadcast(socket, "new_signal", payload)
    {:reply, :ok, socket}
  end
end
