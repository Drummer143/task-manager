defmodule Chat.Messages.Mappers do
  def to_response(message) do
    %{
      id: message.id,
      text: message.text,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      pinnedBy:
        if(is_nil(message.pinner),
          do: nil,
          else: Chat.Users.Mappers.to_response(message.pinner)
        ),
      sender: Chat.Users.Mappers.to_response(message.sender),
      replyTarget: reply_target_to_response(message)
    }
  end

  def reply_target_to_response(message) do
    if is_nil(message.reply_target) do
      nil
    else
      %{
        id: message.reply_target.id,
        text: message.reply_target.text,
        sender: Chat.Users.Mappers.to_response(message.reply_target.sender)
      }
    end
  end
end
