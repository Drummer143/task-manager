defmodule TaskManager.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps/elixir",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: releases()
    ]
  end

  defp releases do
    [
      notifications: [
        applications: [notifications: :permanent],
        include_executables_for: [:unix]
      ],
      chat: [
        applications: [chat: :permanent],
        include_executables_for: [:unix]
      ]
    ]
  end

  # Dependencies listed here are available only for this
  # project and cannot be accessed from applications inside
  # the apps folder.
  #
  # Run "mix help deps" for examples and options.
  defp deps do
    []
  end
end
