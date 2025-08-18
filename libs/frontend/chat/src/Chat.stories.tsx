import { Meta, StoryObj } from "@storybook/react";
import { App } from "antd";

import Chat, { ChatProps, MessageData } from "./Chat";

const mocks: MessageData[] = [
	{
		id: "1",
		text: "Hello",
		createdAt: new Date().toISOString(),
		sender: {
			id: "1",
			name: "User",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "2",
		text: "I need help",
		createdAt: new Date().toISOString(),
		sender: {
			id: "1",
			name: "User",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "3",
		text: "I can help you with a lot of things!",
		createdAt: new Date().toISOString(),
		sender: {
			id: "2",
			name: "Bot",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "4",
		text: "What can I help you with?",
		createdAt: new Date().toISOString(),
		sender: {
			id: "2",
			name: "Bot",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "5",
		text: "Hello",
		createdAt: new Date().toISOString(),
		sender: {
			id: "3",
			name: "One more user",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "6",
		text: "Hello",
		createdAt: new Date().toISOString(),
		sender: {
			id: "4",
			name: "User 142",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	},
	{
		id: "7",
		text: "Hello",
		createdAt: new Date().toISOString(),
		sender: {
			id: "4",
			name: "User 142",
			avatarUrl:
				"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
		}
	}
];

const Component: React.FC<Omit<ChatProps, "onUserClick">> = props => {
	const message = App.useApp().message;

	return (
		<Chat {...props} messages={mocks} onUserClick={id => message.info(`User ${id} clicked`)} />
	);
};

export default {
	title: "Chat",
	component: Component,
	args: {
		currentUserId: "1"
	},
	parameters: {
		layout: "centered"
	}
} satisfies Meta<typeof Component>;

export const Default: StoryObj<typeof Component> = {
	args: {
		currentUserId: "1"
	}
};

export const Dark: StoryObj<typeof Component> = {
	parameters: {
		theme: "dark"
	},
	args: {
		currentUserId: "1"
	}
};

