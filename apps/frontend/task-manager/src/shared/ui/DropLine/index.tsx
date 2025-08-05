import React from "react";

import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types";

import { useStyles } from "./styles";

interface DropLineProps {
	id: string | number;
	edge: Edge;
	offset?: number;
}

const DropLine: React.FC<DropLineProps> = ({ id, edge, offset = 8 }) => {
	const { styles } = useStyles({ edge, offset });

	return <div className={styles.dropLine} />;
};

export default DropLine;
