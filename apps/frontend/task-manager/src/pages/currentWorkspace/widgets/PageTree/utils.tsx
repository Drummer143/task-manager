import { EditOutlined, ExportOutlined } from "@ant-design/icons";
import { PageResponse, PageSummary } from "@task-manager/api/main/schemas";
import { Button, Flex, Typography } from "antd";
import { BasicDataNode, DataNode } from "antd/es/tree";

export const preparePageTree = (
	pages?: (PageResponse | PageSummary)[] | null,
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

				{editable && (
					<Button type="text" title="Edit page" size="small" icon={<EditOutlined />} />
				)}
			</Flex>
		),
		checkable: false,
		selectable: false,
		children: (page as PageResponse).childPages
			? preparePageTree((page as PageResponse).childPages)
			: undefined
	}));

