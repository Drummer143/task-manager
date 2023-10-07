import Link from "next/link";
import React from "react";

import UserPart from "./UserPart";

const Header: React.FC = () => {
    return (
        <header
            className={"sticky z-50 top-0 left-0 w-full h-12 p-4 flex items-center"
                .concat(" justify-between text-white bg-neutral-800")}
        >
            <Link href="/" className="italic font-bold">TASK MANAGER</Link>

            <UserPart />
        </header>
    );
};

export default Header;
