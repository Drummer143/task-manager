defmodule SocketService.Messages.Mappers do
  def to_response(message) do
    %{
      id: message.id,
      text: message.text,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      pinnedBy:
        if(is_nil(message.pinner),
          do: nil,
          else: SocketService.Users.Mappers.to_response(message.pinner)
        ),
      sender: SocketService.Users.Mappers.to_response(message.sender),
      replyTarget: reply_target_to_response(message),
      attachments: attachments_to_response(message)
    }
  end

  def attachments_to_response(message) do
    case message.attachments do
      %Ecto.Association.NotLoaded{} -> []
      nil -> []
      attachments -> Enum.map(attachments, &attachment_to_response/1)
    end
  end

  def attachment_to_response(attachment) do
    %{
      id: attachment.id,
      assetId: attachment.asset_id,
      url: "/files/#{attachment.asset_id}",
      name: if(attachment.asset, do: attachment.asset.name, else: "attachment")
    }
  end

  def reply_target_to_response(message) do
    if is_nil(message.reply_target) do
      nil
    else
      %{
        id: message.reply_target.id,
        text: message.reply_target.text,
        sender: SocketService.Users.Mappers.to_response(message.reply_target.sender)
      }
    end
  end
end
