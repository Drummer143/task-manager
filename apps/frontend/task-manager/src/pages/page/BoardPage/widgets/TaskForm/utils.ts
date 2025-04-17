import { DefaultOptionType } from "antd/es/select";

import { FormValues } from "./types";

import { statusArray, taskStatusLocale } from "../../../../../shared/constants";
import { required } from "../../../../../shared/validation";

export const requiredRule = required();

export const statusSelectOptions: DefaultOptionType[] = statusArray.map(status => ({
	label: taskStatusLocale[status],
	value: status
}));

export const initialValues: Partial<FormValues> = {
	status: "not_done"
};