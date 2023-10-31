"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";
import UserMenuLink from "./UserMenuLink";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { useOuterClick } from "@/hooks/useOuterClick";

type UserMenuProps = {
    user: UserProfile;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const [isMenuOpened, setIsMenuOpened] = useState(false);

    const menuRef = useRef<HTMLButtonElement | null>(null);

    useOuterClick({
        ref: menuRef,
        handler: () => setIsMenuOpened(false),
        active: isMenuOpened
    });

    const handleUserButtonClick = () => {
        setIsMenuOpened(prev =>  !prev);
    };

    return (
        <div className="relative z-50">
            <button
                ref={menuRef}
                onClick={handleUserButtonClick}
                className={"relative z-50 h-7 flex items-center gap-1 p-0.5 md:pr-2 border border-neutral-300".concat(
                    " text-white bg-neutral-800 overflow-hidden rounded-t-[14px]",
                    " cursor-pointer transition-[background-color,_border-radius]",
                    isMenuOpened ? " border-b-transparent bg-neutral-700" : " rounded-b-[14px]",
                    " hover:bg-neutral-600 active:bg-transparent"
                )}
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
                className={"absolute z-[49] top-[calc(100%-1px)] right-0 min-w-[200px] w-full flex flex-col".concat(
                    " bg-black rounded-b-lg max-md:rounded-tl-lg overflow-hidden border border-neutral-300",
                    isMenuOpened ? "" : " hidden"
                )}
            >
                <UserMenuLink href="/profile">Profile</UserMenuLink>
                <UserMenuLink href="/api/auth/logout">Log Out</UserMenuLink>
            </div>
        </div>
    );
};

export default UserMenu;
