import axios, { AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create();

export const insertAccessToken = (getToken: () => Promise<string> | string) => {
	const id = axiosInstance.interceptors.request.use(async config => {
		const token = await getToken();

		config.headers.Authorization = `Bearer ${token}`;

		return config;
	});

	return () => axiosInstance.interceptors.request.eject(id);
};

export const fetcher = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
	axiosInstance<T>({ ...config, ...options }).then(res => res.data);

