import { createStyles } from "antd-style";

interface StyleProps {
	sentByCurrentUser: boolean;
	senderClickable: boolean;

	marginBottom: "small" | "large";
}

const marginBottomMap = {
	small: "2px",
	large: "6px"
};

export const useStyles = createStyles(
	({ css }, { sentByCurrentUser, senderClickable, marginBottom }: StyleProps) => {
		const wrapper = css`
			width: 100%;

			&:not(:last-child) {
				margin-bottom: ${marginBottomMap[marginBottom]};
			}
		`;

		return {
			wrapper,
			messageBody: css`
				max-width: 75%;

				display: flex;
				flex-direction: column;
				gap: var(--ant-padding-xxs);
				word-break: break-word;

				padding: var(--ant-padding-xs);

				border-radius: ${sentByCurrentUser
					? "var(--ant-border-radius) var(--ant-border-radius) 0 var(--ant-border-radius)"
					: "var(--ant-border-radius) var(--ant-border-radius) var(--ant-border-radius) 0"};
				background-color: var(--ant-color-primary-bg);
			`,
			avatar: css`
				${senderClickable && "cursor: pointer !important;"}
			`,
			avatarPlaceholder: css`
				width: 24px;
				pointer-events: none;
			`,
			senderName: css`
				font-size: 11px;
				line-height: 1;

				${senderClickable &&
				css`
					cursor: pointer;

					&:hover {
						text-decoration: underline;
					}
				`}
			`,
			date: css`
				align-self: flex-end;

				display: block;

				margin-left: auto;

				font-size: 11px;
				opacity: 0;
				line-height: 1;
				transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-out-circ);

				.acss-${wrapper.name}:hover & {
					opacity: 1;
				}
			`
		};
	}
);

