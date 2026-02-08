defmodule SocketService.Presence do
  use Phoenix.Presence,
    otp_app: :socket_service,
    pubsub_server: SocketService.PubSub
end
