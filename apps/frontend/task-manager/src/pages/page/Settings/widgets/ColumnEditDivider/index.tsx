import React from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

import { useStyles } from "./styles";

interface ColumnEditDividerProps {
	index: number;
}

const ColumnEditDivider: React.FC<ColumnEditDividerProps> = ({ index }) => {
	const styles = useStyles().styles;

	return (
		<div className={styles.wrapper}>
			<Tooltip title="Add status">
				<Button
					className={styles.addColumnButton}
					type="text"
					size="small"
					icon={<PlusOutlined />}
				/>
			</Tooltip>
		</div>
	);
};

export default ColumnEditDivider;

