defmodule Chat.Repo.Migrations.CreateTaskChatMessages do
  use Ecto.Migration

  def up do
    create_if_not_exists table(:task_chat_messages, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("uuid_generate_v4()")
      add :text, :text, null: false
      add :user_id, :uuid, null: false
      add :task_id, :uuid, null: false
      add :created_at, :utc_datetime, null: false, default: fragment("CURRENT_TIMESTAMP")
      add :updated_at, :utc_datetime, null: false, default: fragment("CURRENT_TIMESTAMP")
      add :deleted_at, :utc_datetime
    end

    create_if_not_exists index(:task_chat_messages, [:task_id], name: :idx_task_chat_messages_task_id)

    alter table(:task_chat_messages) do
      add :user_id, references(:users, type: :uuid), null: false
      add :task_id, references(:tasks, type: :uuid), null: false
    end
  end
end
