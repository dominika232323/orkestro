import {useEffect, useState} from "react";

import GroupsPanel from "../components/GroupsPanel";
import TopBar from "../components/TopBar";
import Messages from "../components/Messages";
import Calendar from "../components/Calendar";
import Settings from "../components/Settings";
import Events from "../components/Events";
import Files from "../components/Files";
import GroupPanel from "../components/GroupPanel";
import {removeTokens, fetchUserOrRedirect} from "../auth";


export default function HomePage() {
  const [page, changePage] = useState("groups");

  useEffect(() => {
    fetchUserOrRedirect();
  }, []);

  const handleLogOut = () => {
    removeTokens();
    window.location.href = "/";
  };

  return (
    <>
      <TopBar handleChangePage={changePage} handleLogOut={handleLogOut} />
      {page === "groups" && <GroupsPanel />}
      {page === "messages" && <Messages/>}
      {page === "calendar" && <Calendar />}
      {page === "settings" && <Settings />}
      {page === "events" && <Events />}
      {page === "files" && <Files />}
      {page === "group" && <GroupPanel />}
    </>
  );
}
