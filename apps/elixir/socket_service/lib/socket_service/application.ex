defmodule SocketService.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      AuthVerifier.TokenStrategy,
      SocketServiceWeb.Telemetry,
      SocketService.Repo,
      {DNSCluster, query: Application.get_env(:socket_service, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SocketService.PubSub},
      SocketService.Presence,
      # Start a worker by calling: SocketService.Worker.start_link(arg)
      # {SocketService.Worker, arg},
      # Start to serve requests, typically the last entry
      SocketServiceWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SocketService.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SocketServiceWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
