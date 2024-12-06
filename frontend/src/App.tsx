import React, {useEffect, useState} from "react";


interface HelloMessage {
    text: string;
}

function App() {
    const [message, setMessage] = useState<HelloMessage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/hello/");
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
    }, []);

    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen bg-blue-500">
                <h1 className="text-4xl font-bold text-white mb-8">API response:</h1>

                {error ?
                    <p className="text-3xl font-bold text-white">{error}</p>
                    :
                    message ?
                        <p className="text-3xl font-bold text-white">{message.text}</p>
                        :
                        <p className="text-3xl font-bold text-white">Loading...</p>
                }
            </div>
        </div>
    );
}

export default App;
