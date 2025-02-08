import React from "react";

import { Empty as AntEmpty, EmptyProps as AntEmptyProps } from "antd";

type EmptyProps = Omit<AntEmptyProps, "image" | "prefixCls" | "children">;

const Empty: React.FC<EmptyProps> = props => <AntEmpty image={AntEmpty.PRESENTED_IMAGE_SIMPLE} {...props} />;

export default Empty;
