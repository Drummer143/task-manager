import Link from "next/link";
import React from "react";

import UserButton from "./UserButton";

const Header: React.FC = () => {
    return (
        <header className="sticky w-full h-12 text-white bg-black p-4 flex items-center justify-between top-0 left-0">
            <Link href="/" className="italic font-bold">TASK MANAGER</Link>

            <UserButton />
        </header>
    );
};

export default Header;
