defmodule Mix.Tasks.Compile.RustMigrator do
  use Mix.Task.Compiler

  @shortdoc "Compiles Rust migrator binary"

  defp find_binary(bin_dir, base_name) do
    candidates =
      [base_name, base_name <> ".exe"]
      |> Enum.map(&Path.join(bin_dir, &1))

    case Enum.find(candidates, &File.exists?/1) do
      nil -> Mix.raise("Rust binary not found in #{bin_dir}")
      path -> path
    end
  end

  @impl true
  def run(_args) do
    root = Path.expand(File.cwd!())
    root = if String.contains?(root, "apps/elixir/migrator") do
      Path.join([root, "..", "..", ".."]) |> Path.absname()
    else
      root
    end
    rust_project = Path.join(root, "libs/backend/migrator")
    priv_dir = :code.priv_dir(:migrator)
    bin_dir = Path.join(root, "dist/target/release")
    bin_path = find_binary(bin_dir, "migrator")

    # source_migrations_dir = Path.join(rust_project, "migrations")
    # dest_migrations_dir = Path.join(priv_dir, "migrations")

    dest = Path.join(priv_dir, Path.basename(bin_path))

    File.mkdir_p!(priv_dir)

    IO.puts("🔧 Building Rust migrator in #{rust_project}...")

    {output, status} =
      System.cmd("cargo", ["build", "--release"],
        cd: rust_project,
        stderr_to_stdout: true
      )

    IO.puts(output)

    if status != 0 do
      Mix.raise("Rust migrator build failed with status #{status}")
    end

    File.cp!(bin_path, dest)
    IO.puts("✅ Copied binary to #{dest}")

    # if File.exists?(source_migrations_dir) do
    #   File.cp_r!(source_migrations_dir, dest_migrations_dir)
    #   IO.puts("✅ Copied migrations to #{dest_migrations_dir}")
    # end

    {:ok, []}
  end
end
