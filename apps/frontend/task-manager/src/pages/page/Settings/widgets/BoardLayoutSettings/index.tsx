import React from "react";

import { Page } from "@task-manager/api";

import SettingsSection from "../SettingsSection";

interface BoardLayoutSettingsProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage" | "workspace">;
}

const BoardLayoutSettings: React.FC<BoardLayoutSettingsProps> = props => {
	return (
		<SettingsSection title="Board layout settings">
			<div>asd</div>
		</SettingsSection>
	);
};

export default BoardLayoutSettings;

