import { PageType, TaskStatus, UserRole } from "@task-manager/api";
import { DefaultOptionType } from "antd/es/select";
import dayjs from "dayjs";

export const statusArray: TaskStatus[] = ["not_done", "in_progress", "done"];

export const taskStatusLocale: Record<TaskStatus, string> = {
  done: "Done",
  in_progress: "In progress",
  not_done: "Not done"
};

export const statusColors: Record<TaskStatus, string> = {
  done: "--ant-color-done",
  in_progress: "--ant-color-in-progress",
  not_done: "--ant-color-not-done"
};

export const pageTypes: PageType[] = ["board", "text", "group"];

export const today = dayjs();

export const userBoardRoles: UserRole[] = [
  "owner",
  "admin",
  "member",
  "commentator",
  "guest"
];

export const userBoardRoleOptions: DefaultOptionType[] = userBoardRoles.map(
  (role) => {
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

    return {
      label: capitalizedRole,
      title: capitalizedRole,
      value: role,
      key: role
    };
  }
);
