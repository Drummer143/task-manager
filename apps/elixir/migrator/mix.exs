defmodule Migrator.MixProject do
  use Mix.Project

  def project do
    [
      app: :migrator,
      version: "0.1.0",
      elixir: "~> 1.14",
      build_path: "../../../dist/libs/migrator",
      config_path: "../../../config/config.exs",
      deps_path: "../../../deps",
      lockfile: "../../../mix.lock",
      compilers: Mix.compilers() ++ [:rust_migrator],
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    []
  end
end
