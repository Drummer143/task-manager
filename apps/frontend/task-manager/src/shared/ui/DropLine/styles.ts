import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types";
import { createStyles, keyframes } from "antd-style";

const dropCircleSize = 8;

export const useStyles = createStyles(
	({ css }, { edge, offset }: { edge: Edge; offset: number }) => {
		const appear = keyframes`
			from {
				opacity: 0;
			}

			to {
				opacity: 1;
			}
		`;

		const position = `${edge === "top" ? "top" : "bottom"}: -${offset}px`;

		return {
			dropLine: css`
				width: 100%;

				position: absolute	;
				${position};

				display: flex;
				align-items: center;

				animation: ${appear} var(--ant-motion-duration-fast) ease-in-out;
				pointer-events: none;

				&::before {
					content: "";
					display: block;
					width: calc(100% - ${dropCircleSize}px);
					height: 2px;
					background-color: var(--ant-color-primary);
				}

				&::after {
					content: "";

					width: ${dropCircleSize}px;
					height: ${dropCircleSize}px;

					display: block;

					border: 2px solid var(--ant-color-primary);
					border-radius: 50%;
				}
			`
		};
	}
);

