"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";

const UserButton: React.FC = () => {
    const { isLoading, user } = useUser();

    if (isLoading) {
        return <p>Loading</p>;
    }

    if (!user) {
        return <Link href="/api/auth/login">Login</Link>;
    }

    console.log({_original: true, ...user}, {
        _original: false,
        email: user.email,
        // eslint-disable-next-line camelcase
        email_verified: user.email_verified,
        name: user.name,
        nickname: user.nickname,
        // eslint-disable-next-line camelcase
        org_id: user.org_id,
        picture: user.picture,
        sub: user.sub,
        // eslint-disable-next-line camelcase
        updated_at: user.updated_at,
    });

    return (
        <Link href={`/user/${user.sub?.split("|")[1]}`}
            className={"flex items-center gap-1 p-0.5 pr-2 overflow-hidden rounded-full bg-neutral-800"
                .concat(" text-white border border-neutral-300 transition-bg cursor-pointer")
                .concat(" hover:bg-neutral-700 active:bg-transparent")}
        >
            {user.picture && (
                <Image
                    width="24"
                    height="24"
                    src={`/api/image/proxy?url=${encodeURIComponent(user.picture)}`}
                    alt="profile picture"
                    className="rounded-full"
                />
            )}

            {user.name}
        </Link>
    );
};

export default UserButton;