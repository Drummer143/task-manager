import { getSession } from "@auth0/nextjs-auth0";
import { WebAuth, Auth0UserProfile } from "auth0-js";

const getUser = async (id: string) =>
    new Promise<Auth0UserProfile>(async (resolve, reject) => {
        console.log({ id });

        const session = await getSession();

        if (!session || !session.accessToken /* || !session.accessTokenExpiresAt || session.accessTokenExpiresAt < Date.now() */) {
            return reject();
        }

        // resolve(session);

        try {
            const auth = new WebAuth({
                domain: process.env.AUTH0_ISSUER_BASE_URL!,
                clientID: process.env.AUTH0_CLIENT_ID!,
            });

            auth.client.userInfo(session.accessToken, (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        } catch (error) {
            reject(error);
        }
    });

interface Props {
    params: {
        lang: I18NLocale;
        id: string;
    }
}

export default async function UserPage({ params: { id } }: Props) {
    try {
        const user = await getUser(id);

        console.log(user);
    } catch (error) {
        // console.log(error);
    }

    return (
        <div>me</div>
    );
}
