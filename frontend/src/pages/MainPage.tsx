import UserPanel from "../components/UserPanel";
import TopBar from "../components/TopBar";
import { useState } from "react";

export default function MainPage() {
  const [page, changePage] = useState("user");
  return (
    <>
      <TopBar handleChangePage={changePage} />
      {page === "user" && <UserPanel />}
    </>
  );
}
