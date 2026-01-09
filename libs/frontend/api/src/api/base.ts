import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: "http://localhost:8080"
});

export const insertAccessToken = (getToken: () => Promise<string>) => {
	axiosInstance.interceptors.request.use(async config => {
		const token = await getToken();

		config.headers["Authorization"] = `Bearer ${token}`;
		return config;
	});
};

type RemoveNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K];
};

type AtLeastOneNotNever<A, B> =
	[A] extends [never]
		? ([B] extends [never] ? never : unknown)
		: unknown;

export type BaseRequest<
	PathParams = never,
	Body = never
> = AtLeastOneNotNever<PathParams, Body> &
	RemoveNever<{
		pathParams: PathParams;
		body: Body;
	}>;


