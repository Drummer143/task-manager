import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type NavPanelLinkProps = Omit<Parameters<typeof Link>[0], "className"> & { icon: React.ReactNode };

const NavPanelLink: React.FC<NavPanelLinkProps> = ({ icon, children, href, ...props }) => {
    const pathname = usePathname();

    return (
        <Link
            href={href}
            className={"flex h-10 items-center gap-2 p-2 transition-bg rounded".concat(
                href === pathname ? " bg-neutral-700" : " hover:bg-neutral-600 active:bg-neutral-700"
            )}
            {...props}
        >
            <div>{icon}</div>

            <p className="flex-1 truncate">{children}</p>
        </Link>
    );
};

export default NavPanelLink;
