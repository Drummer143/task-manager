import React, { useEffect, useRef, useState } from "react";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useStyles } from "./styles";

import { ColumnTargetData, isColumnSource } from "../../utils";

interface ColumnDropTargetProps {
	position: number;
}

const ColumnDropTarget: React.FC<ColumnDropTargetProps> = ({ position }) => {
	const [isDropTarget, setIsDropTarget] = useState(false);

	const styles = useStyles({ isDropTarget }).styles;

	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		const element = ref.current;

		const targetData: ColumnTargetData = {
			type: "column-target",
			position
		};

		return dropTargetForElements({
			element,
			getData: () => targetData as unknown as Record<string, unknown>,
			onDrop: () => setIsDropTarget(false),
			onDragEnter: args => {
				if (!isColumnSource(args.source.data)) {
					return;
				}

				setIsDropTarget(true);
			},
			onDragLeave: () => setIsDropTarget(false)
		});
	}, [position]);

	return <div ref={ref} className={styles.divider} />;
};

export default ColumnDropTarget;

