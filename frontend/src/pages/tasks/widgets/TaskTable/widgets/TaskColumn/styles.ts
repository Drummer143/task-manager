import { createStyles, SerializedStyles } from 'antd-style'
import { updateOpacity } from 'shared/utils';

export const useStyles = createStyles<
    { bgColor: string; outlineColor?: string },
    { wrapper: SerializedStyles; }
>(({ css }, { bgColor, outlineColor }) => ({
    wrapper: css`
        min-width: 15rem;

        background-color: ${updateOpacity(bgColor, 0.3)};
        outline: ${outlineColor ? '2px solid ' + outlineColor : 'none'};
    `
}))