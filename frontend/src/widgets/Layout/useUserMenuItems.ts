import { useMutation } from "@tanstack/react-query";
import { MenuProps } from "antd";
import api from "api";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "store/auth";

export const useUserMenuItems = () => {
	const clear = useAuthStore(state => state.clear)

	const navigate = useNavigate()

	const { mutateAsync } = useMutation({
		mutationFn: () => api.auth.logout().then(clear),
		onSuccess: () => navigate('/login', { replace: true })
	})

	const menu = useMemo<MenuProps>(
		() => ({
			items: [
				{
					key: 'profile',
					label: 'Profile',
					onClick: () => navigate('/profile')
				},
				{
					key: 'div1',
					type: 'divider'
				},
				{
					key: 'logout',
					label: 'Log out',
					onClick: () => mutateAsync()
				}
			]
		}),
		[mutateAsync, navigate]
	)

	return menu
}
