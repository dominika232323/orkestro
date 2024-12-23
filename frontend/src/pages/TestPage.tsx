import {useEffect, useState} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

import {storeTokens, removeTokens, axiosInstance as axios} from "../auth";


interface HelloMessage {
    text: string;
}

export default function TestPage() {
    const [message, setMessage] = useState<HelloMessage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messageP, setMessageP] = useState<HelloMessage | null>(null);
    const [errorP, setErrorP] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);

    // useEffect(() => {
    //     const access_token = localStorage.getItem("access_token");
    //     const refresh_token = localStorage.getItem("refresh_token");
    //     if (access_token && refresh_token) {
    //         // TODO: fetch profile data from backend
    //     }
    // }, []);

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
                console.log("Message:", message);
            } catch (error) {
                setError(`${error}`);
                console.error("Failed to fetch data", error);
            }
        };

        fetchMessage();
    }, [profile]);

    useEffect(() => {
        const fetchMessageProtected = async () => {
            setErrorP(null);
            setMessageP(null);
            const response = axios.get<HelloMessage>("/api/hello-protected/")
            .then((response) => setMessageP(response.data))
            .catch((error) => setErrorP(error.message));
        };

        fetchMessageProtected();
    }, [profile]);

    const handleSuccess = async (credentialResponse: any) => {
        try {
            console.log("Response:", credentialResponse);
            const credential = credentialResponse.credential;
            const decoded: any = jwtDecode(credentialResponse.credential);
            console.log("Decoded User Info:", decoded);

            try {
                const backendResponse = await axios.post(
                    `/api/login-google/`,
                    {"credential": credential}
                );

                const {access_token, refresh_token} = backendResponse.data;
                storeTokens(access_token, refresh_token);
                setProfile(decoded);

                console.log("Login successful:", backendResponse.data);
            } catch (error) {
                console.error("Backend login failed:", error);
            }

        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    };

    const handleError = () => {
        console.log("Login Failed");
    };

    const logOut = () => {
        removeTokens();
        setProfile(null);
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


                {profile ?
                    <div>
                        <img src={profile.picture}/>
                        <h3>User Logged in</h3>
                        <p>Name: {profile.given_name}</p>
                        <p>Surname: {profile.family_name}</p>
                        <p>Email Address: {profile.email}</p>
                        <br />
                        <button onClick={logOut}>Log out</button>
                    </div>
                    :
                    <div className="flex justify-center items-center bg-gray-100">
                        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
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
