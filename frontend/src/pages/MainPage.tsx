import UserPanel from "../components/UserPanel";
import TopBar from "../components/TopBar";
import { useState } from "react";
import Notifications from "../components/Messages";
import Calendar from "../components/Calendar";
import Settings from "../components/Settings";

export default function MainPage() {
  const [page, changePage] = useState("user");
  return (
    <>
      <TopBar handleChangePage={changePage} />
      {page === "user" && <UserPanel />}
      {page === "messages" && <Notifications />}
      {page === "calendar" && <Calendar />}
      {page === "settings" && <Settings />}
    </>
  );
}
