import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import TestPage from "./pages/TestPage";
import MainLayout from "./layouts/MainLayout";
import ManageGroup from "./components/ManageGroup";
import Messages from "./components/Messages";
import Calendar from "./components/Calendar";
import InvitationsAndGroups from "./components/InvitationsAndGroups";
import Events from "./components/Events";
import Files from "./components/Files";
import Settings from "./components/Settings";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/login/",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/invitations-and-groups/" replace />,
        },
        { path: "/manage-group/:groupId", element: <ManageGroup /> },
        { path: "/messages/", element: <Messages /> },
        { path: "/calendar/", element: <Calendar /> },
        { path: "/invitations-and-groups/", element: <InvitationsAndGroups /> },
        { path: "/events/:groupId", element: <Events /> },
        { path: "/files/:groupId", element: <Files /> },
        { path: "/settings/", element: <Settings /> },
      ],
    },
    {
      path: "/test/",
      element: <TestPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}
