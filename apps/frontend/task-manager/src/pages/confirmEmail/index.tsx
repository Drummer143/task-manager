import React, { useEffect, useMemo, useRef } from "react";

import { useMutation } from "@tanstack/react-query";
import { /* confirmEmail, */ parseApiError } from "@task-manager/api";
import { Flex, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

import { useAuthStore } from "../../app/store/auth";
import AuthPageMessageWrapper from "../../shared/ui/AuthPageMessageWrapper";

const ConfirmEmail: React.FC = () => {
	const user = useAuthStore(state => state.user);

	const navigate = useNavigate();

	const token = useSearchParams()[0].get("token");

	const t = useTranslation("confirm_email_page")[0];

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: ({ token }: { token: string }) => Promise.resolve()
	});

	const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const parsedError = useMemo(() => parseApiError(error, undefined, [400, 401]), [error]);

	useEffect(() => {
		if (!token) {
			return;
		}

		mutateAsync({ token }).then(
			() =>
				(redirectTimeoutRef.current = setTimeout(() => {
					navigate(user ? "/profile" : "/login", { replace: true });
				}, 5000))
		);

		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, [mutateAsync, navigate, token, user]);

	if (!token) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>{t("error_title")}</Typography.Title>

				<Typography.Paragraph>{t("token_missing")}</Typography.Paragraph>

				<Typography.Paragraph>{t("request_new_email")}</Typography.Paragraph>

				<Link to={user ? "/profile" : "/login"}>{t("back_to_main_page")}</Link>
			</AuthPageMessageWrapper>
		);
	}

	if (isPending) {
		return (
			<Flex justify="center" vertical align="center" className="h-full w-full">
				<Typography.Title level={3}>{t("loading_title")}</Typography.Title>

				<Spin size="large" />
			</Flex>
		);
	}

	if (error) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>{t("error_title")}</Typography.Title>

				<Typography.Paragraph>
					{t("verification_error", { parsedError })}
				</Typography.Paragraph>

				<Link to={user ? "/profile" : "/login"}>{t("back_to_main_page")}</Link>
			</AuthPageMessageWrapper>
		);
	}

	return (
		<AuthPageMessageWrapper>
			<Typography.Title level={3}>{t("email_confirmed")}</Typography.Title>

			<Typography.Paragraph>{t("email_confirmed_description")}</Typography.Paragraph>

			<Typography.Paragraph>{t("email_confirmed_redirect")}</Typography.Paragraph>

			<Link to={user ? "/profile" : "/login"} replace>
				{t("back_to_main_page")}
			</Link>
		</AuthPageMessageWrapper>
	);
};

export default ConfirmEmail;

