import Link from "next/link";
import React from "react";

import UserPart from "./UserPart";

const Header: React.FC = () => {
    return (
        <header
            className={"grid-area-[header] relative z-50 w-full h-12 p-4 flex items-center justify-between"
                .concat(" border-b border-b-neutral-700 text-white bg-[rgb(32,32,32)]")}
        >
            <Link href="/" className="italic font-bold select-none">TASK MANAGER</Link>

            <UserPart />
        </header>
    );
};

export default Header;
