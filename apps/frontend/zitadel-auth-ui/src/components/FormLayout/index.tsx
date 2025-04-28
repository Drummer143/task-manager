"use client";

import React from "react";

import { Button, Flex, Form, GetProps } from "antd";
import ErrorList from "antd/es/form/ErrorList";
import Text from "antd/es/typography/Text";
import Title from "antd/es/typography/Title";
import { cx } from "antd-style";

import styles from "./styles.module.css";

interface FormLayoutProps<Values> extends GetProps<typeof Form<Values>> {
	error?: string;
	description?: string;

	okText?: string;
	okLoading?: boolean;

	cancelText?: string;
	onCancel?: React.MouseEventHandler<HTMLButtonElement>;
}

const FormLayout = <Values,>({
	className,
	layout = "vertical",
	children,
	onCancel,
	okText = "Submit",
	okLoading = false,
	title,
	description,
	error,
	cancelText = "Cancel",
	...props
}: FormLayoutProps<Values>) => (
	<div className={styles.screen}>
		<Form {...props} className={cx(styles["form-wrapper"], className)} layout={layout}>
			{title && (
				<div className={styles.header}>
					<Title level={2}>{title}</Title>

					{description && <Text>{description}</Text>}
				</div>
			)}

			{children}

			{error && <ErrorList className={styles["error-list"]} errors={[error]} />}

			<Flex justify="end" gap="var(--ant-padding-md)">
				{onCancel && <Button onClick={onCancel}>{cancelText}</Button>}

				<Button loading={okLoading} type="primary" htmlType="submit">
					{okText}
				</Button>
			</Flex>
		</Form>
	</div>
);

export default FormLayout;

