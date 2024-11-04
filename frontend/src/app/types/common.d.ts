import { Rule } from "antd/es/form";

declare global {
	type RuleObject<T extends string = string> = Record<T, Rule[]>;
}

export {};
