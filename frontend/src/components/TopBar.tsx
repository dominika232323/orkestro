import { LanguageSelector, useLanguage } from "../LanguageContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  faCalendarDays,
  faCog,
  faArrowRightFromBracket,
  faMessage,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import HoverText from "./HoverText";
import TopBarIcon from "./TopBarIcon";
import { removeTokens, fetchUserOrRedirect } from "../auth";
import { OrkestroUser } from "../interfaces";

// Top bar over the page
export default function TopBar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<OrkestroUser>();

  // Fetch authenticated user
  useEffect(() => {
    fetchUserOrRedirect(navigate, setUser);
  }, [navigate]);

  // Handle logging out
  const handleLogOut = () => {
    removeTokens();
    navigate("/login/");
  };

  return (
    <div className="relative bg-gray-100 py-4 px-2 sm:px-4 shadow-md flex items-center">
      {/* Left Section - Icons */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <HoverText textToShow={t("top-bar.messages")}>
          <TopBarIcon location="/messages/" iconObject={faMessage} />
        </HoverText>
        <HoverText textToShow={t("top-bar.calendar")}>
          <TopBarIcon location="/calendar/" iconObject={faCalendarDays} />
        </HoverText>
      </div>

      {/* Center Section - Orkestro Title */}
      <a
        href="/invitations-and-groups/"
        onClick={(e) => {
          e.preventDefault(); // prevent the default full-page reload
          navigate("/invitations-and-groups/");
        }}
        className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
      >
        Orkestro
      </a>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
        <div className="relative hidden sm:inline">
          <LanguageSelector />
        </div>
        {user && user.is_staff && (
          <HoverText textToShow={t("top-bar.admin-panel")}>
            <a href="/admin/">
              <TopBarIcon location={null} iconObject={faScrewdriverWrench} />
            </a>
          </HoverText>
        )}
        <HoverText textToShow={t("top-bar.settings")}>
          <TopBarIcon location="/settings/" iconObject={faCog} />
        </HoverText>
        <HoverText textToShow={t("top-bar.logout")}>
          <div onClick={handleLogOut}>
            <TopBarIcon location={null} iconObject={faArrowRightFromBracket} />
          </div>
        </HoverText>
      </div>
    </div>
  );
}
