import React from "react";

import { createStyles } from "antd-style";

import CreateRoom from "./widgets/CreateRoom";

const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		display: flex;
		justify-content: center;

		padding: var(--ant-padding) 0;
	`
}));

const Lobby: React.FC = () => {
	const styles = useStyles().styles;

	return (
		<div className={styles.wrapper}>
			<CreateRoom />
		</div>
	);
};

export default Lobby;

