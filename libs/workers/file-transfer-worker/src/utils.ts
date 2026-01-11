import { FileHasher } from "./hasher/wasm_source";
import { MessageToHost } from "./types";

export const calculateHash = async (file: File) => {
	const hasher = new FileHasher();

	const fileReader = file.stream().getReader();

	while (true) {
		const { value, done } = await fileReader.read();

		if (done) {
			break;
		}

		hasher.update(value);
	}

	return hasher.digest();
};

export const sendProgressEvent = (event: MessageToHost) => {
	postMessage(event);
};

