import { NextResponse } from "next/server";

import connectDB from "@/mongodb";

export const GET = async () => {
    try {
        await connectDB();
    } catch (error) {
        return NextResponse.json({ error: "not connected" }, { status: 500 });
    }

    return NextResponse.json({ message: "message" });
};