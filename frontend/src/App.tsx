import {createBrowserRouter, RouterProvider} from "react-router-dom";

import TestPage from "./pages/TestPage";


function App() {
    const router = createBrowserRouter([
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
