import axios, { InternalAxiosRequestConfig } from "axios";

export const mainInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080"
});

export const storageInstance = axios.create({
	baseURL: import.meta.env.VITE_STORAGE_URL || "http://localhost:8082"
});

export const insertAccessToken = (getToken: () => Promise<string> | string) => {
	const interceptor = async (config: InternalAxiosRequestConfig) => {
		const token = await getToken();

		config.headers["Authorization"] = `Bearer ${token}`;
		return config;
	};

	const id1 = mainInstance.interceptors.request.use(interceptor);
	const id2 = storageInstance.interceptors.request.use(interceptor);

	return () => {
		mainInstance.interceptors.request.eject(id1);
		storageInstance.interceptors.request.eject(id2);
	};
};

type RemoveNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K];
};

type AtLeastOneNotNever<A, B> = [A] extends [never]
	? [B] extends [never]
		? never
		: unknown
	: unknown;

export type BaseRequest<PathParams = never, Body = never> = AtLeastOneNotNever<PathParams, Body> &
	RemoveNever<{
		pathParams: PathParams;
		body: Body;
	}>;

