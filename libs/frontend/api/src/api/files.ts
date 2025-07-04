import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "http://localhost:8082",
	withCredentials: true
});

export interface UploadFileResponse {
	link: string;
}

export const uploadFile = async ({ file, folder }: { file: File; folder?: string }) => {
	const formData = new FormData();

	formData.append("file", file);

	if (folder) {
		formData.append("folder", folder);
	}

	return (await axiosInstance.post<UploadFileResponse>("/actions/upload", formData)).data;
};

