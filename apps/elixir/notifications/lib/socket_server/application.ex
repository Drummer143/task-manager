defmodule SocketServer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SocketServerWeb.Telemetry,
      SocketServer.Repo,
      SocketServer.Consumer,
      {DNSCluster, query: Application.get_env(:notifications, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SocketServer.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: SocketServer.Finch},
      # Start a worker by calling: SocketServer.Worker.start_link(arg)
      # {SocketServer.Worker, arg},
      # Start to serve requests, typically the last entry
      SocketServerWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SocketServer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SocketServerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
