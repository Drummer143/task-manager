import React from "react";

import { PageSummary } from "@task-manager/api/main/schemas";

import SettingsSection from "../SettingsSection";

interface BoardLayoutSettingsProps {
	page: PageSummary;
}

const BoardLayoutSettings: React.FC<BoardLayoutSettingsProps> = props => {
	return (
		<SettingsSection title="Board layout settings">
			<div>asd</div>
		</SettingsSection>
	);
};

export default BoardLayoutSettings;

