import axios from "axios";

import { BaseRequest } from "./base";

const mainInstance = axios.create({
	baseURL: "http://localhost:8082",
	withCredentials: true
});

export interface UploadFileResponse {
	link: string;
}

export type UploadFileRequest = BaseRequest<
	never,
	{
		file: File;
		folder?: string;
	}
>;

export const uploadFile = async (params: UploadFileRequest) => {
	const formData = new FormData();

	formData.append("file", params.body.file);

	if (params.body.folder) {
		formData.append("folder", params.body.folder);
	}

	return (await mainInstance.post<UploadFileResponse>("/actions/upload", formData)).data;
};

