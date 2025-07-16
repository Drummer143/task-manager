import { EditOutlined, ExportOutlined } from "@ant-design/icons";
import { Page } from "@task-manager/api";
import { Button, Flex, Typography } from "antd";
import { BasicDataNode, DataNode } from "antd/es/tree";

export const preparePageTree = (
	pages?: Omit<Page, "workspace" | "owner" | "parentPage" | "tasks" | "boardStatuses">[],
	editable?: boolean
): (BasicDataNode | DataNode)[] | undefined =>
	pages?.map(page => ({
		key: page.id,
		title: (
			<Flex align="center" gap="var(--ant-margin-xs)">
				<Typography.Title level={5}>{page.title}</Typography.Title>

				<Button
					type="text"
					size="small"
					title="Open in new tab"
					onClick={() => window.open(`/pages/${page.id}`, "_blank")}
					icon={<ExportOutlined />}
				/>

				{editable && <Button type="text" title="Edit page" size="small" icon={<EditOutlined />} />}
			</Flex>
		),
		checkable: false,
		selectable: false,
		children: preparePageTree(page.childPages)
	}));