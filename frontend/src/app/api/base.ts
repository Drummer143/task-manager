import axios, { AxiosError } from "axios";

import { useAppStore } from "store/app";

export const axiosInstance = axios.create({
	withCredentials: true,
	baseURL: "http://localhost:8080"
});

axiosInstance.interceptors.response.use(undefined, error => {
	if (
		error instanceof AxiosError &&
		error.config?.url?.includes("workspace") &&
		error.config.data.message === "workspace not found"
	) {
		useAppStore.setState({ workspaceId: undefined });
	}

	return Promise.reject(error);
});
