defmodule Chat.Presence do
  use Phoenix.Presence,
    otp_app: :chat,
    pubsub_server: Chat.PubSub

  @impl true
  def init(_opts) do
    {:ok, %{}}
  end

  @impl true
  def handle_metas(topic, %{joins: joins, leaves: leaves}, presences, state) do
    for {user_id, _meta} <- joins do
      total_user_connections = Map.get(presences, user_id, []) |> length()

      if total_user_connections == 1 do
        Redix.command(:redix, ["SADD", "presences:#{topic}", user_id])
      end
    end

    for {user_id, _meta} <- leaves do
      if not Map.has_key?(presences, user_id) do
        Redix.command(:redix, ["SREM", "presences:#{topic}", user_id])
      end
    end

    {:ok, state}
  end
end
