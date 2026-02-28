import React, { useCallback, useEffect, useRef, useState } from "react";

import { Modal } from "antd";
import Cropper, { Area } from "react-easy-crop";

import { useStyles } from "./styles";

interface ImageCropProps {
	onCropFinish: (croppedAreaPixels: Area) => Promise<void> | void;

	image?: File;
	isOpen?: boolean;
	confirmLoading?: boolean;

	onCancel?: () => void;
}

const ImageCrop: React.FC<ImageCropProps> = ({
	image,
	isOpen,
	confirmLoading,
	onCancel,
	onCropFinish
}) => {
	const [zoom, setZoom] = useState(1);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | undefined>(undefined);

	const { cropWrapper } = useStyles().styles;

	const cropWrapperRef = useRef<HTMLDivElement | null>(null);

	const handleClose = useCallback(() => {
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}

		onCancel?.();
	}, [imageUrl, onCancel]);

	const handleCropComplete = useCallback(
		(_: Area, croppedAreaPixels: Area) => setCroppedAreaPixels(croppedAreaPixels),
		[]
	);

	useEffect(() => {
		if (!isOpen || !image) {
			return;
		}

		setImageUrl(URL.createObjectURL(image));
	}, [image, isOpen]);

	return (
		<Modal
			open={isOpen}
			onCancel={handleClose}
			confirmLoading={confirmLoading}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			onOk={() => onCropFinish(croppedAreaPixels!)}
		>
			<div className={cropWrapper} ref={cropWrapperRef}>
				<Cropper
					crop={crop}
					zoom={zoom}
					aspect={1}
					onZoomChange={setZoom}
					onCropChange={setCrop}
					image={imageUrl}
					onCropComplete={handleCropComplete}
				/>
			</div>
		</Modal>
	);
};

export default ImageCrop;

