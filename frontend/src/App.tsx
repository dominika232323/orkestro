import {createBrowserRouter, RouterProvider} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";


function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginPage />,
        },
        {
            path: "/home",
            element: <HomePage/>,
        },
        {
            path: "/test/",
            element: <TestPage/>,
        },
    ]);

    return (
        <RouterProvider router={router}/>
    );
}

export default App;
