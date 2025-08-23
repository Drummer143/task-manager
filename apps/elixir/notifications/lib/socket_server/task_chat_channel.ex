# defmodule Notifications.TaskChatChannel do
#   use Phoenix.Channel

#   def join("chat:" <> _task_id, _payload, socket) do
#     {:ok, socket}
#   end

#   def handle_in(event, payload, socket) do
#     broadcast("")
#   end
# end
