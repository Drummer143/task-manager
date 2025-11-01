defmodule Chat.Chats.Chat do
  import Ecto.Query

  alias Chat.Repo

  def find_by_task_id(task_id) do
    Chat.Chats.Model
    |> where([c], c.task_id == ^task_id)
    |> Repo.one()
  end
end
