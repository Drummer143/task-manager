defmodule Notifications.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {AuthVerifier.TokenStrategy, url: Application.get_env(:auth_verifier, :jwks_url)},
      NotificationsWeb.Telemetry,
      Notifications.Repo,
      Notifications.Consumer,
      {DNSCluster, query: Application.get_env(:notifications, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Notifications.PubSub},
      # Start a worker by calling: Notifications.Worker.start_link(arg)
      # {Notifications.Worker, arg},
      # Start to serve requests, typically the last entry
      NotificationsWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Notifications.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    NotificationsWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
