import Link from "next/link";
import React from "react";

import UserPart from "./UserPart";
import ToggleNavbarButton from "./ToggleNavbarButton";

const Header: React.FC = () => {
    return (
        <header
            className={"relative z-50 w-full h-[var(--header-height,3rem)] p-4 flex items-center justify-between"
                .concat(" border-b border-b-neutral-700 text-white bg-[rgb(32,32,32)]")}
        >
            <div className="flex gap-3 items-center">
                <ToggleNavbarButton />

                <Link href="/" className="italic font-bold select-none">TASK MANAGER</Link>
            </div>

            <UserPart />
        </header>
    );
};

export default Header;
