"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import UserMenuLink from "./UserMenuLink";

type UserMenuProps = {
    user: UserProfile
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const [isMenuOpened, setIsMenuOpened] = useState(false);

    const handleCloseMenuOnClickAway = useCallback((e: MouseEvent) => {
        const target = e.target as Element | null;

        const closestTarget = target?.closest("#userMenu");

        if (!closestTarget) {
            setIsMenuOpened(false);

            document.removeEventListener("click", handleCloseMenuOnClickAway);
        }

    }, []);

    const handleUserButtonClick = () => {
        let isMenuOpened = false;

        setIsMenuOpened(prev => {
            isMenuOpened = prev;

            return !prev;
        });

        if (!isMenuOpened) {
            document.addEventListener("click", handleCloseMenuOnClickAway);
        } else {
            document.removeEventListener("click", handleCloseMenuOnClickAway);
        }
    };

    return (
        <div className="relative z-50">
            <button
                id="userMenu"
                onClick={handleUserButtonClick}
                className={"relative z-50 h-7 flex items-center gap-1 p-0.5 md:pr-2 border border-neutral-300"
                    .concat(" text-white bg-neutral-800 overflow-hidden rounded-t-[14px]")
                    .concat(" cursor-pointer transition-[background-color,_border-radius]")
                    .concat(isMenuOpened ? " border-b-transparent bg-neutral-700" : " rounded-b-[14px]")
                    .concat(" hover:bg-neutral-600 active:bg-transparent")}
            >
                {user.picture ? (
                    <Image
                        width="24"
                        height="24"
                        src={`/api/image/proxy?url=${encodeURIComponent(user.picture)}`}
                        alt="profile picture"
                        className="rounded-full"
                    />
                ) : (
                    <div className="h-6 aspect-square rounded-full bg-neutral-500"></div>
                )}

                <p className="max-md:hidden">{user.name}</p>
            </button>

            <div
                className={"absolute z-[49] top-[calc(100%-1px)] right-0 min-w-[200px] w-full flex flex-col"
                    .concat(" bg-black rounded-b-lg max-md:rounded-tl-lg overflow-hidden border border-neutral-300")
                    .concat(isMenuOpened ? "" : " hidden")}
            >
                <UserMenuLink href="/profile">Profile</UserMenuLink>
                <UserMenuLink href="/api/auth/logout">Log Out</UserMenuLink>
            </div>
        </div>
    );
};

export default UserMenu;