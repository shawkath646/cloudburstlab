import { cache } from "react";

const getSession = cache(async () => {

    const session = {
        id: ""
    };

    return session;
});

export {
    getSession
};