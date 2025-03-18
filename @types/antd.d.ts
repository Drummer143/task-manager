import 'antd/es/theme/internal';

type BaseToken = import('antd/es/theme/internal').AliasToken;

declare module 'antd/es/theme/internal' {
  interface AliasToken extends BaseToken {
    colorDone?: string;
    colorInProgress?: string;
    colorNotDone?: string;
    imageCropMaskColor?: string;
    colorTaskGroupTitle?: string;
  }
}
