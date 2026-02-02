import { BaseRequest, storageInstance } from "./base";

export interface Asset {
	id: string;
	name: string;
	created_at: string;
}

export interface VerifyRange {
	start: number;
	end: number;
}

export interface UploadChunkedResponse {
	transactionId: string;
	maxConcurrentUploads: number;
	chunkSize: number;
}

export interface UploadWholeFileResponse {
	transactionId: string;
}

export interface VerifyRangesResponse {
	transactionId: string;
	ranges: VerifyRange[];
}

export type UploadInitResponse =
	| { nextStep: "startUploadChunked"; data: UploadChunkedResponse }
	| { nextStep: "startUploadWholeFile"; data: UploadWholeFileResponse }
	| { nextStep: "verifyRanges"; data: VerifyRangesResponse };

export type UploadInitRequest = BaseRequest<
	never,
	{
		hash: string;
		uploadToken: string;
		size: number;
	}
>;

export const uploadInit = async (params: UploadInitRequest, signal?: AbortSignal) =>
	(
		await storageInstance.post<UploadInitResponse>("/actions/upload/init", params.body, {
			signal
		})
	).data;

export type UploadWholeFileRequest = BaseRequest<{ transactionId: string }, Blob>;

export const uploadWholeFile = async (params: UploadWholeFileRequest, signal?: AbortSignal) =>
	(
		await storageInstance.post<UploadSuccessResponse>(
			`/actions/upload/${params.pathParams.transactionId}/whole-file`,
			params.body,
			{ signal }
		)
	).data;

export type UploadChunkRequest = BaseRequest<
	{ transactionId: string },
	{
		chunk: Blob;
		start: number;
		end: number;
		total: number;
	}
>;

export const uploadChunk = async (params: UploadChunkRequest, signal?: AbortSignal) => {
	const { chunk, start, end, total } = params.body;

	await storageInstance.post<void>(
		`/actions/upload/${params.pathParams.transactionId}/chunk`,
		chunk,
		{
			signal,
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Range": `bytes ${start}-${end}/${total}`
			}
		}
	);
};

export type UploadVerifyRequest = BaseRequest<
	{ transactionId: string },
	{
		ranges: ArrayBuffer[];
	}
>;

export type UploadSuccessResponse = {
	asset: Asset;
	mime_type: string;
};

export const uploadVerify = async (params: UploadVerifyRequest, signal?: AbortSignal) =>
	(
		await storageInstance.post<UploadSuccessResponse>(
			`/actions/upload/${params.pathParams.transactionId}/verify`,
			{ ranges: params.body.ranges.map(buf => Array.from(new Uint8Array(buf))) },
			{ signal }
		)
	).data;

export type UploadCompleteRequest = BaseRequest<{ transactionId: string }>;

export const uploadComplete = async (params: UploadCompleteRequest, signal?: AbortSignal) =>
	(
		await storageInstance.post<UploadSuccessResponse>(
			`/actions/upload/${params.pathParams.transactionId}/complete`,
			undefined,
			{ signal }
		)
	).data;

export type UploadStatusRequest = BaseRequest<{ transactionId: string }>;

export interface UploadChunkedStatusResponse {
	maxConcurrentUploads: number;
	chunkSize: number;

	missingChunks?: number[];
}

export interface VerifyRangesStatusResponse {
	ranges: VerifyRange[];
}

export type UploadStatusResponse =
	| { currentStep: "uploadChunked"; data: UploadChunkedStatusResponse }
	| { currentStep: "uploadWholeFile" }
	| { currentStep: "verifyRanges"; data: VerifyRangesStatusResponse }
	| { currentStep: "complete" };

export const uploadStatus = async (params: UploadStatusRequest, signal?: AbortSignal) =>
	(
		await storageInstance.get<UploadStatusResponse>(
			`/actions/upload/${params.pathParams.transactionId}/status`,
			{ signal }
		)
	).data;

export type UploadCancelRequest = BaseRequest<{ transactionId: string }>;

export const uploadCancel = async (params: UploadCancelRequest, signal?: AbortSignal) =>
	await storageInstance.delete<void>(
		`/actions/upload/${params.pathParams.transactionId}/cancel`,
		{
			signal
		}
	);

