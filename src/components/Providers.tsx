"use client";

import React from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";

type ProvidersProps = {
    children?: React.ReactNode;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    )
}

export default Providers;