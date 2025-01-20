import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import MainLayout from "./layouts/MainLayout";
import MessagesPage from "./pages/MessagesPage";
import CalendarPage from "./pages/CalendarPage";
import InvitationsAndGroups from "./components/InvitationsAndGroups";
import EventsPage from "./pages/EventsPage";
import TracksPage from "./pages/TracksPage";
import SettingsPage from "./pages/SettingsPage";
import EventEditPage from "./pages/EventEditPage";
import EventNewPage from "./pages/EventNewPage";
import MessageNewPage from "./pages/MessageNewPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import TrackDetailsPage from "./pages/TrackDetailsPage";
import TrackEditPage from "./pages/TrackEditPage";
import ManageGroupPage from "./pages/ManageGroupPage";
import TrackNewPage from "./pages/TrackNewPage";
import GroupNewPage from "./pages/GroupNewPage";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/login/",
      element: <LoginPage />,
    },
    {
      path: "/privacy-policy/",
      element: <PrivacyPolicyPage />,
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
        { path: "/messages/", element: <MessagesPage /> },
        { path: "/calendar/", element: <CalendarPage /> },
        { path: "/invitations-and-groups/", element: <InvitationsAndGroups /> },
        { path: "/events/:groupId", element: <EventsPage /> },
        { path: "/tracks/:groupId", element: <TracksPage /> },
        { path: "/settings/", element: <SettingsPage /> },
        { path: "/edit-event/:eventId", element: <EventEditPage /> },
        { path: "/new-event/:groupId", element: <EventNewPage /> },
        { path: "/new-message/:groupId", element: <MessageNewPage /> },
        { path: "/event-details/:eventId", element: <EventDetailsPage /> },
        {
          path: "/track-details/:trackId/:groupId",
          element: <TrackDetailsPage />,
        },
        { path: "/edit-track/:trackId/:groupId", element: <TrackEditPage /> },
        { path: "/manage-group/:groupId", element: <ManageGroupPage /> },
        { path: "/new-track/:groupId", element: <TrackNewPage /> },
        {
          path: "/new-group/:userId/:superGroupId?",
          element: <GroupNewPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
