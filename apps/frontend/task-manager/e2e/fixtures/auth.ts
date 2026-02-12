import fs from "fs";
import path from "path";

export { expect, test } from "@playwright/test";

export function getTestUser(): { username: string; email: string } {
	const filePath = path.resolve("apps/frontend/task-manager/e2e/.auth/test-user.json");

	return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
