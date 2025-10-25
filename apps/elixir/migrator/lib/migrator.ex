defmodule Migrator do
  @moduledoc """
  Elixir wrapper for Rust CLI migrator.
  """

  @bin Path.join(:code.priv_dir(:migrator), "migrator")

  def up() do
    System.cmd(@bin, ["up"], into: IO.stream(:stdio, :line))
  end

  def down() do
    System.cmd(@bin, ["down"], into: IO.stream(:stdio, :line))
  end
end
