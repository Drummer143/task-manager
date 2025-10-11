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
      sender: Chat.Users.Mappers.to_response(message.sender)
    }
  end
end
