defmodule Chat.Repo do
  use Ecto.Repo,
    otp_app: :chat,
    adapter: Ecto.Adapters.Postgres

  @impl true
  def init(_, opts) do
    {:ok, Keyword.put(opts, :loggers, [])}
  end
end
