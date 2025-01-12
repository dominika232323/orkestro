import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
// import ManageGroup from "./components/ManageGroup";
import Messages from "./components/Messages";
import Calendar from "./components/Calendar";
import InvitationsAndGroups from "./components/InvitationsAndGroups";
import Events from "./components/Events";
import Tracks from "./components/Tracks";
import Settings from "./components/Settings";
import EventEditPage from "./pages/EventEditPage";
import EventNewPage from "./pages/EventNewPage";
import MessageNew from "./pages/MessageNew";
import EventDetailsPage from "./pages/EventDetailsPage";
import TrackDetailsPage from "./pages/TrackDetailsPage";
import TrackEditPage from "./pages/TrackEditPage";
import ManageGroup from "./components/ManageGroup";
import TrackNewPage from "./pages/TrackNewPage";

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
        // { path: "/manage-group/:groupId", element: <ManageGroup /> },
        { path: "/messages/", element: <Messages /> },
        { path: "/calendar/", element: <Calendar /> },
        { path: "/invitations-and-groups/", element: <InvitationsAndGroups /> },
        { path: "/events/:groupId", element: <Events /> },
        { path: "/tracks/:groupId", element: <Tracks /> },
        { path: "/settings/", element: <Settings /> },
        { path: "/edit-event/:eventId", element: <EventEditPage /> },
        { path: "/new-event/:groupId", element: <EventNewPage /> },
        { path: "/new-message/:groupId", element: <MessageNew /> },
        { path: "/event-details/:eventId", element: <EventDetailsPage /> },
        {
          path: "/track-details/:trackId/:groupId",
          element: <TrackDetailsPage />,
        },
        { path: "/edit-track/:trackId/:groupId", element: <TrackEditPage /> },
        { path: "/manage-group/:groupId", element: <ManageGroup /> },
        { path: "/new-track/:groupId", element: <TrackNewPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
