defmodule AuthVerifier.Token do
  use Joken.Config

  require Logger

  add_hook(JokenJwks, strategy: AuthVerifier.TokenStrategy)

  def token_config do
    expected_iss = Application.fetch_env!(:auth_verifier, :issuer)
    expected_aud = Application.fetch_env!(:auth_verifier, :audience)

    default_claims()
    |> add_claim("iss", nil, fn val -> val == expected_iss end)
    |> add_claim("aud", nil, fn val -> val == expected_aud end)
  end
end
