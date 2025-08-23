defmodule Notifications.Consumer do
  use GenServer
  require Logger
  use AMQP

  def start_link(args), do: GenServer.start_link(__MODULE__, args, [])

  @exchange "gen_server_test_exchange"
  @queue "refresh_signals"
  @queue_error "#{@queue}_error"

  def init(_opts) do
    {:ok, conn} = Connection.open(System.get_env("RABBITMQ_URL"))
    {:ok, chan} = Channel.open(conn)

    setup_queue(chan)

    :ok = Basic.qos(chan, prefetch_count: 10)
    {:ok, _} = Basic.consume(chan, @queue)
    {:ok, chan}
  end

  def handle_info({:basic_consume_ok, %{consumer_tag: _}}, chan), do: {:noreply, chan}

  def handle_info({:basic_cancel, %{consumer_tag: _}}, chan), do: {:stop, :normal, chan}

  def handle_info({:basic_cancel_ok, %{consumer_tag: _}}, chan), do: {:noreply, chan}

  def handle_info({:basic_deliver, payload, %{delivery_tag: tag, redelivered: redelivered}}, chan) do
    case consume(chan, tag, redelivered, payload) do
      :ok ->
        Basic.ack(chan, tag)
      :error ->
        Basic.nack(chan, tag, requeue: false)
    end
    {:noreply, chan}
  end

  def handle_info({:DOWN, _, :process, _pid, reason}, state), do: {:stop, reason, state}

  defp setup_queue(chan) do
    {:ok, _} = Queue.declare(chan, @queue_error, durable: true)
    {:ok, _} = Queue.declare(chan, @queue, durable: true)
    :ok = Exchange.fanout(chan, @exchange, durable: true)
    :ok = Queue.bind(chan, @queue, @exchange)
  end

  defp consume(_, tag, _, payload) do
    try do
      Logger.info("Processing message: #{payload}")

      decoded_payload = case Jason.decode(payload) do
        {:ok, data} -> data
        {:error, _} ->
          Logger.warning("Failed to decode JSON payload, using raw string", [payload])
          %{"raw_message" => payload}
      end

      NotificationsWeb.Endpoint.broadcast("signals", "refresh", decoded_payload)

      Logger.info("Message processed successfully, tag: #{tag}")
      :ok
    rescue
      error ->
        Logger.error("Error processing message: #{inspect(error)}")
        Logger.error("Payload: #{payload}")
        :error
    end
  end

  def terminate(reason, chan) do
    Logger.info("Consumer terminating: #{inspect(reason)}")

    if Process.alive?(chan.pid) do
      Channel.close(chan)
    end
  end
end
