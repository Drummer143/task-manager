defmodule Chat.Users.Mappers do
  def to_response(user) do
    %{
      id: user.id,
      username: user.username,
      avatar: user.picture
    }
  end
end
