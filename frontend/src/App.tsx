import {createBrowserRouter, RouterProvider} from "react-router-dom";

import {LanguageProvider} from "./LanguageContext";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import TestPage from "./pages/TestPage";


function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginPage />,
        },
        {
            path: "/main-page",
            element: <MainPage/>,
        },
        {
            path: "/test/",
            element: <TestPage/>,
        },
    ]);

    return (
        <LanguageProvider>
            <RouterProvider router={router}/>
        </LanguageProvider>
    );
}

export default App;
