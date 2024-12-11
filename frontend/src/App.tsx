import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";

import { useTranslation } from "react-i18next";
import { LanguageProvider } from "./LanguageContext";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LanguageProvider>
          <LoginPage />
        </LanguageProvider>
      ),
    },
    {
      path: "/main-page",
      element: (
        <LanguageProvider>
          <MainPage />
        </LanguageProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
