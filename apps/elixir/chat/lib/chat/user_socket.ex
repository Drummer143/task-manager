defmodule Chat.UserSocket do
  require Logger
  use Phoenix.Socket

  channel "chat:*", Chat.ChatChannel

  def connect(%{"token" => token}, socket, _connect_info) do
    case AuthVerifier.Token.verify_and_validate(token) do
      {:ok, claims} ->
        sub = claims["sub"]

        {:ok, assign(socket, :user_id, sub)}

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info) do
    {:error, :unauthorized}
  end

  def id(socket), do: "socket:#{socket.assigns.user_id}"
end
