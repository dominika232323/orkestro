import GroupsPanel from "../components/GroupsPanel";
import TopBar from "../components/TopBar";
import { useState } from "react";
import Notifications from "../components/Messages";
import Calendar from "../components/Calendar";
import Settings from "../components/Settings";
import Events from "../components/Events";

export default function MainPage() {
  const [page, changePage] = useState("groups");
  const handleLogOut = function () {};
  return (
    <>
      <TopBar handleChangePage={changePage} handleLogOut={handleLogOut} />
      {page === "groups" && <GroupsPanel />}
      {page === "messages" && <Notifications />}
      {page === "calendar" && <Calendar />}
      {page === "settings" && <Settings />}
      {page === "events" && <Events />}
    </>
  );
}
