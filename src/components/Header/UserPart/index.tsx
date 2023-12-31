"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

import UserMenu from "./UserMenu";

const UserPart: React.FC = () => {
    const { isLoading, user, checkSession } = useUser();

    useEffect(() => {
        checkSession();
    }, []);

    if (isLoading) {
        return <p>Loading</p>;
    }

    if (!user) {
        return <Link href="/api/auth/login" prefetch={false}>Login</Link>;
    }

    return <UserMenu user={user} />;
};

export default UserPart;
