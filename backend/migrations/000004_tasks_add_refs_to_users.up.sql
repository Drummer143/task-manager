ALTER TABLE "users"
ADD COLUMN deleted_at timestamp;

ALTER TABLE "tasks"
ADD COLUMN deleted_at timestamp;

ALTER TABLE "tasks" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("user_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("assigned_to") REFERENCES "users" ("user_id");