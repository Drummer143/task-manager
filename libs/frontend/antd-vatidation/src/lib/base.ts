import { Rule, RuleObject } from "antd/es/form";

type MakeRuleFunc<T = void> = (args: T) => Rule[];

export const required: MakeRuleFunc = () => [
	{
		required: true,
		message: "This field is required"
	}
];

export const email: MakeRuleFunc = () => [
	{ type: "email", message: "Invalid email format. Example: example@mail.com" }
];

const generateLengthMessage = (type: RuleObject["type"], border: "min" | "max", value: number) => {
	switch (type) {
		case "number":
			return `Value must be ${border === "min" ? "at least" : "at most"} ${value}`;
		case "array":
			return `Number of values must be ${border === "min" ? "at least" : "at most"} ${value}`;
		default:
			return `Field length must be ${border === "min" ? "at least" : "at most"} ${value}`;
	}
};

export const min: MakeRuleFunc<{ min: number; type?: RuleObject["type"] | undefined }> = args => [
	{ message: generateLengthMessage(args.type, "min", args.min), ...args }
];

export const max: MakeRuleFunc<{ max: number; type?: RuleObject["type"] | undefined }> = args => [
	{ message: generateLengthMessage(args.type, "max", args.max), ...args }
];

export const range: MakeRuleFunc<{ min: number; max: number; type?: RuleObject["type"] | undefined }> = args => [
	{ message: generateLengthMessage(args.type, "min", args.min), min: args.min },
	{ message: generateLengthMessage(args.type, "max", args.max), max: args.max }
];

export const password: MakeRuleFunc = () => [
	...range({ min: 8, max: 16, type: "string" }),
	{ pattern: /(?=.*[a-z])/, message: "Password must contain at least one lowercase letter" },
	{ pattern: /(?=.*[A-Z])/, message: "Password must contain at least one uppercase letter" },
	{ pattern: /(?=.*[0-9])/, message: "Password must contain at least one digit" },
	{
		pattern: /(?=.*[!@#$%^&*()\-_=+[\]{}|;:'",<.>/?])/,
		message: "Password must contain at least one special character"
	}
];

export const confirmPassword: MakeRuleFunc = () => [
	...required(),
	({ getFieldValue }) => ({
		validator: (_, value) => {
			if (!value || getFieldValue("password") === value) {
				return Promise.resolve();
			}

			return Promise.reject(new Error("Passwords do not match"));
		}
	})
];

export const composeRules = (...rules: Array<Rule[] | Rule>) => rules.flat();