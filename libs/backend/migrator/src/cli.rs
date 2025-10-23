use clap::{Parser, Subcommand};

use migrator::{
    MigrationDirection,
    migrator::{create_migration, migrate},
};

#[derive(Parser)]
#[command(version, about, long_about = None, name = "migrator")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Apply all new migrations")]
    Up,
    #[command(about = "Revert all applied migrations")]
    Down,
    #[command(about = r#"Create a new migration files.

Structure:
- {version}_{name}
    - up.sql
    - down.sql
"#)]
    Create {
        #[arg(index(1))]
        name: String,
    },
}

#[tokio::main]
pub async fn main() {
    match Cli::parse().command {
        Commands::Up => {
            migrate(MigrationDirection::Up)
                .await
                .unwrap();
        }
        Commands::Down => {
            migrate(MigrationDirection::Down)
                .await
                .unwrap();
        }
        Commands::Create { name } => {
            create_migration(name).unwrap();
        }
    }
}
