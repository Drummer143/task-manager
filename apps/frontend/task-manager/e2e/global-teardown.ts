import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve("apps/frontend/task-manager/.env") });

async function globalTeardown() {
	const userInfoPath = path.resolve("apps/frontend/task-manager/e2e/.auth/test-user.json");

	if (!fs.existsSync(userInfoPath)) {
		console.warn("[teardown] No test user info found, skipping cleanup");
		return;
	}

	const { username } = JSON.parse(fs.readFileSync(userInfoPath, "utf-8"));

	const apiToken = process.env.VITE_AUTHENTIK_API_TOKEN;

	if (!apiToken) {
		throw new Error("[teardown] VITE_AUTHENTIK_API_TOKEN not set in .env, skipping user cleanup");
	}

	const authentikBase = process.env.AUTHENTIK_URL;

	if (!authentikBase) {
		throw new Error("[teardown] AUTHENTIK_URL not set in .env, skipping user cleanup");
	}

	try {
		// Find user by username
		const searchResp = await fetch(
			`${authentikBase}/api/v3/core/users/?search=${encodeURIComponent(username)}`,
			{
				headers: { Authorization: `Bearer ${apiToken}` }
			}
		);

		if (!searchResp.ok) {
			console.error(`[teardown] Failed to search user: ${searchResp.status}`);
			return;
		}

		const searchData = await searchResp.json();
		const user = searchData.results?.find(
			(u: { username: string }) => u.username === username
		);

		if (!user) {
			console.warn(`[teardown] User "${username}" not found in Authentik`);
			return;
		}

		// Delete user
		const deleteResp = await fetch(
			`${authentikBase}/api/v3/core/users/${user.pk}/`,
			{
				method: "DELETE",
				headers: { Authorization: `Bearer ${apiToken}` }
			}
		);

		if (deleteResp.ok || deleteResp.status === 204) {
			console.info(`[teardown] Deleted test user "${username}" (pk=${user.pk})`);
		} else {
			console.error(`[teardown] Failed to delete user: ${deleteResp.status}`);
		}
	} catch (err) {
		console.error("[teardown] Error during cleanup:", err);
	} finally {
		// Clean up temp files
		fs.rmSync(path.resolve("apps/frontend/task-manager/e2e/.auth"), {
			recursive: true,
			force: true
		});
	}
}

export default globalTeardown;
