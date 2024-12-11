import UserPanel from "../components/UserPanel";
import TopBar from "../components/TopBar";
import { useState } from "react";
import Notifications from "../components/Notifications";

export default function MainPage() {
  const [page, changePage] = useState("user");
  return (
    <>
      <TopBar handleChangePage={changePage} />
      {page === "user" && <UserPanel />}
      {page === "notifications" && <Notifications />}
    </>
  );
}
