import React, { useCallback, useEffect, useRef, useState } from "react";

import { Modal } from "antd";
import Cropper, { Area } from "react-easy-crop";

import { CropWrapper } from "./styles";

interface ImageCropProps {
	onCropFinish: (croppedAreaPixels: Area) => void;

	image?: File;
	isOpen?: boolean;

	onCancel?: () => void;
}

const ImageCrop: React.FC<ImageCropProps> = ({ image, isOpen, onCancel, onCropFinish }) => {
	const [zoom, setZoom] = useState(1);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | undefined>(undefined);

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
		<Modal open={isOpen} onCancel={handleClose} onOk={() => onCropFinish(croppedAreaPixels!)}>
			<CropWrapper ref={cropWrapperRef}>
				<Cropper
					crop={crop}
					zoom={zoom}
					aspect={1}
					onZoomChange={setZoom}
					onCropChange={setCrop}
					image={imageUrl}
					onCropComplete={handleCropComplete}
				/>
			</CropWrapper>
		</Modal>
	);
};

export default ImageCrop;
