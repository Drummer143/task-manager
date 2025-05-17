export type UploadedFileInfo = {
	url: string;
	name: string;
	size: number;
	type: string;

	width?: number;
	height?: number;
};

export type UploadFn = (file: File) => Promise<UploadedFileInfo> | UploadedFileInfo;

export interface FileUploadPluginOptions {
	accept: string;
	maxFileSize: number;

	uploadFn: Record<string, UploadFn>;
	onFileSizeExceeded?: (file: File) => void;
	onWrongFileFormat?: (file: File) => void;
}

