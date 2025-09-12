import React, { useMemo } from "react";

import { Typography } from "antd";

import { useStyles } from "./styles";

interface DividerProps {
	date: Date;
	renderYear?: boolean;
}

const Divider: React.FC<DividerProps> = ({ date, renderYear }) => {
	const formattedDate = useMemo(
		() =>
			date.toLocaleDateString(undefined, {
				day: "2-digit",
				month: "short",
				year: renderYear ? undefined : "numeric"
			}),
		[date, renderYear]
	);

	const styles = useStyles().styles;

	return (
		<div className={styles.wrapper}>
			<Typography.Text>{formattedDate}</Typography.Text>
		</div>
	);
};

export default Divider;

