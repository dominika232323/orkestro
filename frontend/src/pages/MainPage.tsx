import Groups from "../components/Groups";
import Invitations from "../components/Invitations";
import TopBar from "../components/TopBar";
import LanguageProps from "../interfaces/LanguageProps";
import { useState } from "react";

export default function MainPage({
  handleLanguageChange,
  translationObject,
}: LanguageProps) {
  const [page, changePage] = useState("user");

  function handleChangePage(newPage: string) {
    changePage(newPage);
  }

  return (
    <>
      <TopBar
        handleLanguageChange={handleLanguageChange}
        handleChangePage={handleChangePage}
        translationObject={translationObject}
      />
      {page === "user" && (
        <div className="space-y-8">
          <Invitations
            handleLanguageChange={handleLanguageChange}
            translationObject={translationObject}
          />
          <Groups />
        </div>
      )}
    </>
  );
}
