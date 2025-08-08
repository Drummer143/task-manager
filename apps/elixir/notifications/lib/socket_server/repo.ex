defmodule SocketServer.Repo do
  use Ecto.Repo,
    otp_app: :notifications,
    adapter: Ecto.Adapters.Postgres
end
