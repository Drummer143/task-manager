CREATE TABLE
	"users" (
		"email" varchar(63) NOT NULL,
		"email_verified" bool NOT NULL DEFAULT false,
		"name" varchar(63) NOT NULL,
		"nickname" varchar(63) NOT NULL,
		"picture" varchar(255),
		"user_id" varchar(63) PRIMARY KEY NOT NULL,
		"username" varchar(63) NOT NULL,
		"last_password_reset" timestamptz,
		"last_ip" varchar(15),
		"last_login" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"logins_count" int NOT NULL DEFAULT 0,
		"created_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP),
		"updated_at" timestamptz NOT NULL DEFAULT (CURRENT_TIMESTAMP)
	);