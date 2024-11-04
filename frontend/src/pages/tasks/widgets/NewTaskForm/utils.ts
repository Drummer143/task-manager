import { DefaultOptionType } from "antd/es/select";

import { statusArray, taskStatusLocale } from "shared/utils";
import { required } from "shared/validation";

import { FormValues } from "./types";

export const requiredRule = required();

export const statusSelectOptions: DefaultOptionType[] = statusArray.map(status => ({
	label: taskStatusLocale[status],
	value: status
}));

export const initialValues: Partial<FormValues> = {
	status: "not_done"
};
