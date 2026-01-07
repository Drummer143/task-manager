export interface ComputePositionOptions {
	/** Координата X точки привязки (например, clientX клика) */
	anchorX: number;
	/** Координата Y точки привязки (например, clientY клика) */
	anchorY: number;
	/** Ширина позиционируемого элемента */
	elementWidth: number;
	/** Высота позиционируемого элемента */
	elementHeight: number;
	/** Отступ от точки привязки */
	offset?: number;
	/** Отступ от краёв viewport */
	viewportPadding?: number;
}

export interface ComputePositionResult {
	x: number;
	y: number;
	flippedX: boolean;
	flippedY: boolean;
}

/**
 * Вычисляет позицию абсолютно спозиционированного элемента так,
 * чтобы он оставался во viewport.
 *
 * Логика:
 * 1. Пробуем разместить элемент в исходном направлении (вправо-вниз от anchor)
 * 2. Если не помещается — пробуем flip (влево/вверх)
 * 3. Если flip тоже не помещается — clamp к границам viewport
 */
export function computePosition(options: ComputePositionOptions): ComputePositionResult {
	const {
		anchorX,
		anchorY,
		elementWidth,
		elementHeight,
		offset = 0,
		viewportPadding = 0
	} = options;

	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	const minX = viewportPadding;
	const maxX = viewportWidth - viewportPadding - elementWidth;
	const minY = viewportPadding;
	const maxY = viewportHeight - viewportPadding - elementHeight;

	let x: number;
	let y: number;
	let flippedX = false;
	let flippedY = false;

	// --- X axis ---
	const rightX = anchorX + offset;
	const leftX = anchorX - offset - elementWidth;

	if (rightX + elementWidth <= viewportWidth - viewportPadding) {
		// Помещается справа
		x = rightX;
	} else if (leftX >= viewportPadding) {
		// Flip влево
		x = leftX;
		flippedX = true;
	} else {
		// Clamp относительно исходной позиции (справа)
		x = Math.max(minX, Math.min(rightX, maxX));
	}

	// --- Y axis ---
	const bottomY = anchorY + offset;
	const topY = anchorY - offset - elementHeight;

	if (bottomY + elementHeight <= viewportHeight - viewportPadding) {
		// Помещается снизу
		y = bottomY;
	} else if (topY >= viewportPadding) {
		// Flip вверх
		y = topY;
		flippedY = true;
	} else {
		// Clamp относительно исходной позиции (снизу)
		y = Math.max(minY, Math.min(bottomY, maxY));
	}

	return { x, y, flippedX, flippedY };
}
