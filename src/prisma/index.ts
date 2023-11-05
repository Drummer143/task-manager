import { PrismaClient } from "@prisma/client";

let isConnected = false;
const client = new PrismaClient();

export const getClient = async () => {
    if (!isConnected) {
        await client.$connect();

        isConnected = true;
    }

    return { user: client.user };
};
