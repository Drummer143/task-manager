import React, { memo, useCallback } from "react";

import { ArrowRightOutlined } from "@ant-design/icons";
import { PaginationQuery, ResponseWithPagination, VersionHistoryLog } from "@task-manager/api";
import { Avatar, Button, Divider, Empty, Flex, Typography } from "antd";
import { ListLocale } from "antd/es/list";
import { createStyles } from "antd-style";

import ListWithInfiniteScroll from "../ListWithInfiniteScroll";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VersionEntryRendererFunction = (info: any) => React.ReactNode;

const useStyles = createStyles(({ css }) => ({
	changeCompareWrapper: css`
		display: grid;
		grid-template-columns: 1fr min-content 1fr;
		align-items: center;

		& > *:last-child {
			justify-self: end;
		}
	`
}));

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
	enabled?: boolean;
	changeOrder?: Keys[];
	entryRenders?: VersionHistoryEntryRenders<Keys>;

	fetchLog: (query?: PaginationQuery) => Promise<ResponseWithPagination<VersionHistoryLog<Keys>>>;
}

const defaultRenderer: VersionEntryRendererFunction = info => info?.toString();

const listLocale: ListLocale = {
	emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="This task is not changed yet" />
};

const VersionHistoryList = <Keys extends string = string>({
	fetchLog,
	entryRenders,
	changeOrder,
	enabled
}: VersionHistoryListProps<Keys>) => {
	const { styles } = useStyles();

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

	// const dropdownMenu = useMemo<MenuProps>(
	// 	() => ({
	// 		items: [
	// 			{
	// 				key: "rollback",
	// 				label: "Rollback to this version"
	// 			}
	// 		]
	// 	}),
	// 	[]
	// );

	return (
		<ListWithInfiniteScroll<VersionHistoryLog<Keys>>
			itemLayout="vertical"
			locale={listLocale}
			fetchItems={fetchLog}
			enabled={enabled}
			queryKey={["version-history"]}
			renderItem={(item, i, versionList) => (
				<>
					<Flex vertical gap="var(--ant-margin-sm)">
						<Flex justify="space-between" align="center">
							<Typography.Title level={5}>Version {item.version}</Typography.Title>

							<Button
								type="text"
								icon={<Avatar size="small" src={item.user.picture || "/avatar-placeholder-32.jpg"} />}
							>
								{item.user.name}
							</Button>
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

										<div className={styles.changeCompareWrapper}>
											<div>
												{getRenderer(key as Keys, "from")(item.changes[key as Keys]?.from)}
											</div>
											<ArrowRightOutlined />
											<div>{getRenderer(key as Keys, "to")(item.changes[key as Keys]?.to)}</div>
										</div>
									</React.Fragment>
								)
						)}
					</Flex>

					{i !== versionList.length - 1 && <Divider style={{ margin: "var(--ant-margin-xs) 0" }} />}
				</>
			)}
		/>
	);
};

export default memo(VersionHistoryList);
