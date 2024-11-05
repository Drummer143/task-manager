import { axiosInstance } from "./base";

export const get = async () => (await axiosInstance.get<User>("/profile")).data;