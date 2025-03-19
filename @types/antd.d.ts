import "antd/es/theme/internal";

type BaseToken = import("antd/es/theme/internal").AliasToken;
type ExtraThemeToken = import("@task-manager/ant-config").ExtraThemeToken;

declare module "antd/es/theme/internal" {
	interface AliasToken extends BaseToken, ExtraThemeToken {}
}
