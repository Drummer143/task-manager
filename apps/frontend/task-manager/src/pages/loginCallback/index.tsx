import React, { useEffect } from "react";

import { userManager } from "../../app/auth";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const LoginCallback: React.FC = () => {
    useEffect(() => {
        userManager.signinCallback().then(console.log);
    });

    return (
        <FullSizeLoader />
    );
};

export default LoginCallback;
