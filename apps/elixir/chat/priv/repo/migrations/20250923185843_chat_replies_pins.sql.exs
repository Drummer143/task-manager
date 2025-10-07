defmodule Chat.Repo.Migrations.ChatRepliesPins do
  use Ecto.Migration

  def change do
    alter table(:task_chat_messages) do
      add :pinned, :boolean, default: false, null: false
      add :reply_to, references(:task_chat_messages, on_delete: :nilify_all), null: true
    end
  end
end
