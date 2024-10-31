import { createStyles, CSSObject } from "antd-style"
import { updateOpacity } from "shared/utils"

export const useStyles = createStyles<string, { task: CSSObject }>(({ css }, bgColor) => ({
	task: css`
		background-color: ${updateOpacity(bgColor, 0.3)};
	`,
}))