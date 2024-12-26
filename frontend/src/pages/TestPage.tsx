import {useEffect, useState} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

import {getAccessToken, getRefreshToken, storeTokens, removeTokens, axiosInstance as axios} from "../auth";


interface HelloMessage {
    text: string;
}

interface User {
  email: string;
  name: string;
  surname: string;
  google_user_id: string;
  google_calendar_id: string;
}

export default function TestPage() {
    const [user, setUser] = useState<User | null>(null);
    const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);
    const [message, setMessage] = useState<HelloMessage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messageP, setMessageP] = useState<HelloMessage | null>(null);
    const [errorP, setErrorP] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = getAccessToken();
            const refresh_token = getRefreshToken();
            if (access_token || refresh_token) {
                await axios.get<User>("/api/users/me/")
                .then((response) => {
                    setUser(response.data);
                    console.log("Logged in as:", response.data)
                })
                .catch((error) => console.error("Error fetching user data:", error));
            }
        }

        fetchUser();
    }, [justLoggedIn]);

    useEffect(() => {
        const fetchMessage = async () => {
            setError(null);
            setMessage(null);
            try {
                const response = await fetch("/api/hello-world/");
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const result: HelloMessage = await response.json();
                setMessage(result);
            } catch (error) {
                setError(`${error}`);
            }
        };

        fetchMessage();
    }, [user]);

    useEffect(() => {
        const fetchMessageProtected = async () => {
            setErrorP(null);
            setMessageP(null);

            axios.get<HelloMessage>("/api/hello-protected/")
            .then((response) => setMessageP(response.data))
            .catch((error) => setErrorP(error.message));
        };

        fetchMessageProtected();
    }, [user]);

    const handleLoginSuccess = async (credentialResponse: any) => {
        try {
            const credential = credentialResponse.credential;
            const decoded: any = jwtDecode(credentialResponse.credential);
            console.log("Google login successful:", decoded);

            await axios.post(
                "/api/login-google/",
                {"credential": credential}
            )
            .then((backendResponse) => {
                const {access_token, refresh_token} = backendResponse.data;
                storeTokens(access_token, refresh_token);
                setJustLoggedIn(true);
                console.log("Backend login successful:", backendResponse.data);
            })
            .catch((error) => console.error("Backend login failed:", error));

        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    };

    const handleError = () => {
        console.log("Google login failed");
    };

    const logOut = () => {
        removeTokens();
        setUser(null);
    };

    return (
        <div>
            <div className="flex flex-col items-center h-screen justify-center bg-blue-500">
                <h1 className="text-4xl font-bold text-white mb-6">API response:</h1>

                {error ?
                    <p className="text-3xl font-bold text-white mb-8">{error}</p>
                    :
                    message ?
                        <p className="text-3xl font-bold text-white mb-8">{message.text}</p>
                        :
                        <p className="text-3xl font-bold text-white mb-8">Loading...</p>
                }


                {user ?
                    <div>
                        <p>Email: {user.email}</p>
                        <p>Name: {user.name}</p>
                        <p>Surname: {user.surname}</p>
                        <p> Google user ID: {user.google_user_id}</p>
                        <p> Google calendar ID: {user.google_calendar_id}</p>
                        <button className="bg-white" onClick={logOut}>Log out</button>
                    </div>
                    :
                    <div className="flex justify-center items-center bg-gray-100">
                        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleError} />
                    </div>
                }


                <h1 className="text-4xl font-bold text-white mb-6 mt-8">API protected:</h1>

                {errorP ?
                    <p className="text-3xl font-bold text-white">{errorP}</p>
                    :
                    messageP ?
                        <p className="text-3xl font-bold text-white">{messageP.text}</p>
                        :
                        <p className="text-3xl font-bold text-white">Loading...</p>
                }
            </div>
        </div>
    );
}
