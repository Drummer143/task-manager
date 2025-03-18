import React, { memo, useCallback, useMemo } from "react";

import { MoreOutlined } from "@ant-design/icons";
import { Button, Divider, Dropdown, Empty, Flex, List, MenuProps, Typography } from "antd";
import { ListLocale } from "antd/es/list";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VersionEntryRendererFunction = (info: any) => React.ReactNode;

type VersionEntryRendererObject = {
	withFieldName?: boolean;
} & (
	| {
			from?: VersionEntryRendererFunction;
			to?: VersionEntryRendererFunction;
	  }
	| {
			default: VersionEntryRendererFunction;
	  }
);

export type VersionHistoryEntryRenders<Keys extends string = string> = Partial<
	Record<Keys, VersionEntryRendererFunction | VersionEntryRendererObject>
>;

export interface VersionHistoryListProps<Keys extends string = string> {
	versionList?: VersionHistoryLog<Keys>[];
	changeOrder?: Keys[];
	entryRenders?: VersionHistoryEntryRenders<Keys>;
}

const defaultRenderer: VersionEntryRendererFunction = info => info?.toString();

const listLocale: ListLocale = {
	emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="This task is not changed yet" />
};

const VersionHistoryList = <Keys extends string = string>({
	entryRenders,
	versionList,
	changeOrder
}: VersionHistoryListProps<Keys>) => {
	const getRenderer = useCallback(
		(key: Keys, change: "from" | "to"): VersionEntryRendererFunction => {
			if (!entryRenders) {
				return defaultRenderer;
			}

			const entryRenderer = entryRenders[key];

			if (!entryRenderer) {
				return defaultRenderer;
			}

			if (typeof entryRenderer === "function") {
				return entryRenderer;
			}

			return ("default" in entryRenderer ? entryRenderer.default : entryRenderer[change]) ?? defaultRenderer;
		},
		[entryRenders]
	);

	const dropdownMenu = useMemo<MenuProps>(
		() => ({
			items: [
				{
					key: "rollback",
					label: "Rollback to this version"
				}
			]
		}),
		[]
	);

	return (
		<List
			locale={listLocale}
			dataSource={versionList || []}
			renderItem={(item, i) => (
				<>
					<div>
						<Flex justify="space-between" align="center">
							<Typography.Title level={5}>Version {item.version}</Typography.Title>

							<Dropdown menu={dropdownMenu} trigger={["click"]}>
								<Button type="text" icon={<MoreOutlined />} shape="circle" />
							</Dropdown>
						</Flex>

						{(changeOrder || Object.keys(item.changes)).map(
							key =>
								item.changes[key as Keys] && (
									<React.Fragment key={key}>
										{(
											(entryRenders as VersionHistoryEntryRenders)?.[
												key
											] as VersionEntryRendererObject
										)?.withFieldName && <Typography.Text strong>{key}</Typography.Text>}

										<Flex justify="space-between" align="center">
											<div>
												{getRenderer(key as Keys, "from")(item.changes[key as Keys]?.from)}
											</div>
											-&gt;
											<div>{getRenderer(key as Keys, "to")(item.changes[key as Keys]?.to)}</div>
										</Flex>
									</React.Fragment>
								)
						)}
					</div>

					{i !== versionList!.length - 1 && <Divider style={{ margin: "var(--ant-margin-xs) 0" }} />}
				</>
			)}
		/>
	);
};

export default memo(VersionHistoryList);
