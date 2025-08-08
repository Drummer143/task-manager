import React from "react";

import { Alert, Typography } from "antd";

interface SettingsSectionProps {
	title: string;
	children: React.ReactNode;

	error?: string | null;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, error }) => {
	return (
		<section style={{ height: "fit-content" }}>
			<Typography.Title level={4}>{title}</Typography.Title>

			{error ? (
				<Alert
					message={`Failed to get info about ${title.toLowerCase()}`}
					description={error}
					type="error"
				/>
			) : (
				children
			)}
		</section>
	);
};

export default SettingsSection;

