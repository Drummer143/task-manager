import React, { memo } from "react";

import { MenuOutlined } from "@ant-design/icons";
import { Dropdown, GetProp, MenuProps } from "antd";
import { createStyles } from "antd-style";

interface OptionsMenuProps {
	options?: GetProp<MenuProps, "items">;
}

const useStyles = createStyles(({ css }) => ({
	optionsMenu: css`
		position: absolute;
		top: 0;
		right: 0;
		z-index: 2;
	`
}));

const OptionsMenu: React.FC<OptionsMenuProps> = (props) => {
	const styles = useStyles().styles;

	return (
		<Dropdown menu={{ items: props.options }} trigger={["click"]}>
			<MenuOutlined className={styles.optionsMenu} />
		</Dropdown>
	);
};

export default memo(OptionsMenu);

