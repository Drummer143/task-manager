import React, { useMemo } from "react";

import { Typography } from "antd";

import { useStyles } from "./styles";

const currentYear = new Date().getFullYear();

export interface DividerProps {
	date: string;
}

const Divider: React.FC<DividerProps> = ({ date: dateStr }) => {
	const formattedDate = useMemo(() => {
		const date = new Date(dateStr);

		return date.toLocaleDateString(undefined, {
			day: "2-digit",
			month: "short",
			year: date.getFullYear() === currentYear ? undefined : "numeric"
		});
	}, [dateStr]);

	const styles = useStyles().styles;

	return <Typography.Paragraph className={styles.wrapper}>{formattedDate}</Typography.Paragraph>;
};

export default Divider;

