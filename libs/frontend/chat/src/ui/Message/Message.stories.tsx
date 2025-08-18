import { Meta, StoryObj } from "@storybook/react";
import { App } from "antd";

import Message, { MessageProps } from ".";

const Component: React.FC<Omit<MessageProps, "onSenderClick">> = props => {
	const message = App.useApp().message;

	return <Message {...props} onSenderClick={() => message.info("Sender clicked")} />;
};

export default {
	title: "Message",
	component: Component,
	parameters: {
		layout: "centered"
	}
} satisfies Meta<typeof Component>;

export const Default: StoryObj<typeof Component> = {
	args: {
		text: "Hello",
		createdAt: new Date().toISOString(),
		sentByCurrentUser: true,
		senderName: "User",
		avatarUrl:
			"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
	}
};

export const MessageWithSenderClickable: StoryObj<typeof Component> = {
	args: {
		text: "Hello",
		createdAt: new Date().toISOString(),
		sentByCurrentUser: false,
		senderName: "User",
		avatarUrl:
			"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
	}
};

export const Dark: StoryObj<typeof Component> = {
	parameters: {
		theme: "dark"
	},
	args: {
		text: "Hello",
		createdAt: new Date().toISOString(),
		sentByCurrentUser: false,
		senderName: "User",
		avatarUrl:
			"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
	}
};

