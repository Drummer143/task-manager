export const drawRoundedRect = (
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) => {
	context.beginPath();
	context.moveTo(x + radius, y);
	context.lineTo(x + width - radius, y);
	context.arcTo(x + width, y, x + width, y + radius, radius);
	context.lineTo(x + width, y + height - radius);
	context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	context.lineTo(x + radius, y + height);
	context.arcTo(x, y + height, x, y + height - radius, radius);
	context.lineTo(x, y + radius);
	context.arcTo(x, y, x + radius, y, radius);
	context.closePath();
};

export const drawTaskDragImage = (task: Task, statusColor: string) => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	if (!context) return;

	const paddingX = 8;
	const paddingY = 4;
	const fontSize = 16;
	const font = `bold ${fontSize}px sans-serif`;

	context.font = font;

	const textWidth = context.measureText(task.title).width;
	const borderRadius = 4;

	canvas.width = textWidth + paddingX * 2;
	canvas.height = fontSize + paddingY * 2;

	context.fillStyle = statusColor;
	drawRoundedRect(context, 0, 0, canvas.width, canvas.height, borderRadius);
	context.fill();

	context.fillStyle = "white";
	context.font = font;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(task.title, canvas.width / 2, canvas.height / 2);

	return canvas;
};
