import React, { memo, useMemo } from "react";

import {
	Drawer as AntDrawer,
	DrawerProps as AntDrawerProps,
	Button,
	ButtonProps,
	Form,
	FormProps,
	Space
} from "antd";

interface DrawerProps<Values extends object = never> extends Omit<AntDrawerProps, "open" | "onClose"> {
	open: boolean;

	onClose: AntDrawerProps["onClose"];

	okText?: string;
	okType?: ButtonProps["type"];
	okProps?: ButtonProps;
	okLoading?: boolean;
	okDisabled?: boolean;

	cancelText?: string;
	cancelType?: ButtonProps["type"];
	cancelProps?: ButtonProps;

	form?: true | FormProps<Values>;

	onOk?: Values extends never ? React.MouseEventHandler<HTMLElement> : FormProps<Values>["onFinish"];
	onCancel?: React.MouseEventHandler<HTMLElement>;

	afterClose?: () => void;
}

const Drawer = <Values extends object = never>({
	form,
	extra: propsExtra,
	drawerRender: propsDrawerRender,
	onOk,
	okText,
	okType,
	okProps,
	okLoading,
	okDisabled,
	onCancel,
	cancelText,
	cancelType,
	afterClose,
	cancelProps,
	afterOpenChange,
	...props
}: DrawerProps<Values>) => {
	const drawerRender: AntDrawerProps["drawerRender"] = useMemo(() => {
		const formProps: FormProps<Values> | undefined = form === true ? {} : form;

		if (formProps) {
			formProps.layout ??= "vertical";
			formProps.onFinish ??= onOk;

			if (formProps.className) {
				formProps.className += " h-full";
			} else {
				formProps.className = "h-full";
			}
		}

		if (typeof propsDrawerRender === "function") {
			if (formProps) {
				return node => propsDrawerRender(<Form {...formProps}>{node}</Form>);
			} else {
				return propsDrawerRender;
			}
		}

		if (propsDrawerRender) {
			return propsDrawerRender;
		}

		if (formProps) {
			return node => <Form {...formProps}>{node}</Form>;
		}
	}, [form, onOk, propsDrawerRender]);

	const extra = useMemo(() => {
		if (propsExtra === false || propsExtra === null) {
			return null;
		}

		if (propsExtra) {
			return propsExtra;
		}

		if (!form && !onOk && !onCancel) {
			return;
		}

		const okButtonProps: ButtonProps = { ...okProps };
		const cancelButtonProps: ButtonProps = { ...cancelProps };

		if (onOk || form) {
			okButtonProps.loading ??= okLoading;
			okButtonProps.disabled ??= okDisabled;
			okButtonProps.type ??= okType ?? "primary";
			okButtonProps.children ??= okText ?? "Save";
			okButtonProps.htmlType = form ? "submit" : (okButtonProps.htmlType ?? "button");
			okButtonProps.onClick ??= form ? undefined : (onOk as React.MouseEventHandler<HTMLElement>);
		}

		if (onCancel || form) {
			cancelButtonProps.type ??= cancelType ?? "default";
			cancelButtonProps.children ??= cancelText ?? "Cancel";
			cancelButtonProps.htmlType = form ? "reset" : (cancelButtonProps.htmlType ?? "button");
			cancelButtonProps.onClick ??= onCancel ?? props.onClose;
		}

		return (
			<Space>
				{(onOk || form) && <Button {...cancelButtonProps} />}

				{(onOk || form) && <Button {...okButtonProps} />}
			</Space>
		);
	}, [
		cancelProps,
		cancelText,
		cancelType,
		form,
		okDisabled,
		okLoading,
		okProps,
		okText,
		okType,
		onCancel,
		onOk,
		props.onClose,
		propsExtra
	]);

	const handleAfterOpenChange = useMemo<DrawerProps["afterOpenChange"]>(() => {
		if (afterClose || afterOpenChange) {
			return open => {
				if (!open) {
					afterClose?.();
				}

				afterOpenChange?.(open);
			};
		}
	}, [afterClose, afterOpenChange]);

	return <AntDrawer {...props} afterOpenChange={handleAfterOpenChange} drawerRender={drawerRender} extra={extra} />;
};

export default memo(Drawer) as typeof Drawer;
