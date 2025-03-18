import { create } from "zustand";

interface TasksState {
	dragging?: string;
	dropTarget?: TaskStatus;

	setDragging: (status?: string) => void;
	setDropTarget: (status?: TaskStatus) => void;
}

export const useTasksStore = create<TasksState>(set => ({
	setDragging: dragging => set({ dragging }),

	setDropTarget: dropTarget => set({ dropTarget })
}));
