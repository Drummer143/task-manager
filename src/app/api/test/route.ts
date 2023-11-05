import { NextResponse/* , NextRequest */ } from "next/server";

import { getClient } from "@/prisma";

export const GET = async (/* req: NextRequest, params: { params: undefined } */) => {
    try {
        const client = await getClient();

        return NextResponse.json({
            "data": new Date().toString(),
            countOfUsers: await client.user.count()
        });
    } catch (error) {
        return NextResponse.json({ error: "not connected" }, { status: 500 });
    }
};
