import {useEffect, useState} from "react";

import TopBar from "../components/TopBar";
import ManageGroupsPanel from "../components/ManageGroupsPanel";
import Messages from "../components/Messages";
import Calendar from "../components/Calendar";
import InvitationsAndGroups from "../components/InvitationsAndGroups";
import Events from "../components/Events";
import Files from "../components/Files";
import Settings from "../components/Settings";
import {removeTokens, fetchUserOrRedirect} from "../auth";


export default function HomePage() {
  const [page, changePage] = useState("invitations-and-groups");

  useEffect(() => {
    fetchUserOrRedirect();
  }, []);

  const handleLogOut = () => {
    removeTokens();
    window.location.href = "/";
  };

  return (
    <>
      <TopBar handleChangePage={changePage} handleLogOut={handleLogOut}/>
      {page === "manage-groups" && <ManageGroupsPanel/>}
      {page === "messages" && <Messages/>}
      {page === "calendar" && <Calendar/>}
      {page === "invitations-and-groups" && <InvitationsAndGroups/>}
      {page === "events" && <Events/>}
      {page === "files" && <Files/>}
      {page === "settings" && <Settings/>}
    </>
  );
}
