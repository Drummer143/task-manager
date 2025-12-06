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

