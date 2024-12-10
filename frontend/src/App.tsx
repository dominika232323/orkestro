import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";

import { useTranslation } from "react-i18next";

function App() {
  const { t: translationObject, i18n } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LoginPage
          handleLanguageChange={handleLanguageChange}
          translationObject={translationObject}
        />
      ),
    },
    {
      path: "/main-page",
      element: (
        <MainPage
          handleLanguageChange={handleLanguageChange}
          translationObject={translationObject}
        />
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
