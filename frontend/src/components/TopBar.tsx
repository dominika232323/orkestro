import {useLanguage} from "../LanguageContext";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
  faCalendarDays,
  faCog,
  faArrowRightFromBracket,
  faMessage,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import HoverText from "./HoverText";
import TopBarIcon from "./TopBarIcon";
import {removeTokens, fetchUserOrRedirect} from "../auth";


export default function TopBar() {
  const navigate = useNavigate();
  const { t, changeLanguage, currentLanguage } = useLanguage();

  useEffect(() => {
    fetchUserOrRedirect(navigate);
  }, []);

  const handleLogOut = () => {
    removeTokens();
    navigate("/login/");
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
      {/* Left Section - Icons */}
      <div className="flex items-center space-x-4">
        <HoverText textToShow={t("top-bar.manage-groups")}>
          <TopBarIcon
            location="manage-groups/"
            iconObject={faUsers}
          />
        </HoverText>
        <HoverText textToShow={t("top-bar.messages")}>
          <TopBarIcon
            location="/messages/"
            iconObject={faMessage}
          />
        </HoverText>
        <HoverText textToShow={t("top-bar.calendar")}>
          <TopBarIcon
            location="/calendar/"
            iconObject={faCalendarDays}
          />
        </HoverText>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center space-x-6 text-sm">
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => navigate("/invitations-and-groups/")}
        >
          {t("top-bar.invitations-and-groups")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => navigate("/events/")}
        >
          {t("top-bar.events")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => navigate("/files/")}
        >
          {t("top-bar.files")}
        </button>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select
            className="bg-white border border-gray-300 rounded-md text-sm p-1"
            onChange={(e) => changeLanguage(e.target.value)}
            value={currentLanguage}
          >
            <option value="pl">🇵🇱 Polski</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        <HoverText textToShow={t("top-bar.settings")}>
          <TopBarIcon
            location="/settings/"
            iconObject={faCog}
          />
        </HoverText>
        <button onClick={handleLogOut}>
          <HoverText textToShow={t("top-bar.logout")}>
            <TopBarIcon
              location={null}
              iconObject={faArrowRightFromBracket}
            />
          </HoverText>
        </button>
      </div>
    </div>
  );
}
