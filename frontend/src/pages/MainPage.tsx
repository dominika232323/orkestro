import {useEffect, useState} from "react";

import GroupsPanel from "../components/GroupsPanel";
import TopBar from "../components/TopBar";
import Notifications from "../components/Messages";
import Calendar from "../components/Calendar";
import Settings from "../components/Settings";
import Events from "../components/Events";
import Files from "../components/Files";
import GroupPanel from "../components/GroupPanel";
import {User} from "../interfaces";
import {getAccessToken, getRefreshToken, removeTokens, axiosInstance as axios} from "../auth";


export default function MainPage() {
  const [page, changePage] = useState("groups");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const access_token = getAccessToken();
      const refresh_token = getRefreshToken();
      if (access_token || refresh_token) {
        await axios.get<User>("/api/users/me/")
          .then((response) => {
            setUser(response.data);
            console.log("Logged in as:", response.data)
          })
          .catch((error) => {
            console.error("Error fetching user data, redirecting to login:", error)
            window.location.href = "/";
          });
      }
      else {
        console.error("No tokens, redirecting to login")
        window.location.href = "/";
      }
    }

    fetchUser();
  }, []);

  const handleLogOut = () => {
    removeTokens();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      <TopBar handleChangePage={changePage} handleLogOut={handleLogOut} />
      {page === "groups" && <GroupsPanel />}
      {page === "messages" && <Notifications />}
      {page === "calendar" && <Calendar />}
      {page === "settings" && <Settings />}
      {page === "events" && <Events />}
      {page === "files" && <Files />}
      {page === "group" && <GroupPanel />}
    </>
  );
}
