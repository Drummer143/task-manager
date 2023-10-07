import Link from "next/link";
import React from "react";

type UserMenuLinkProps = Omit<Parameters<typeof Link>[0], "className">;

const UserMenuLink: React.FC<UserMenuLinkProps> = props => (
    <Link
        className="w-full h-8 flex items-center px-2 hover:bg-neutral-700 active:bg-neutral-800"
        {...props}
    />
);

export default UserMenuLink;