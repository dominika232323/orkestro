import { useLanguage } from "../LanguageContext";
import { Link } from "react-router-dom";
import {
  faCalendarDays,
  faCog,
  faKey,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import HoverText from "./HoverText";
import TopBarIcon from "./TopBarIcon";

interface TopBarProps {
  handleChangePage: (newPage: string) => void;
  handleLogOut: () => void;
}

export default function TopBar({
  handleChangePage,
  handleLogOut,
}: TopBarProps) {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
      {/* Left Section - Icons */}
      <div className="flex items-center space-x-4">
        <HoverText textToShow={t("top-bar.group")}>
          <TopBarIcon
            handleChangePage={handleChangePage}
            pageName="group"
            iconObject={faUser}
          />
        </HoverText>
        <HoverText textToShow={t("top-bar.messages")}>
          <TopBarIcon
            handleChangePage={handleChangePage}
            pageName="messages"
            iconObject={faMessage}
          />
        </HoverText>
        <HoverText textToShow={t("top-bar.calendar")}>
          <TopBarIcon
            handleChangePage={handleChangePage}
            pageName="calendar"
            iconObject={faCalendarDays}
          />
        </HoverText>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center space-x-6 text-sm">
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("groups")}
        >
          {t("top-bar.groups")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("events")}
        >
          {t("top-bar.events")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("files")}
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
            handleChangePage={handleChangePage}
            pageName="settings"
            iconObject={faCog}
          />
        </HoverText>
        <Link to="/">
          <HoverText textToShow={t("top-bar.logout")}>
            <TopBarIcon
              handleChangePage={() => {}}
              pageName=""
              iconObject={faKey}
            />
          </HoverText>
        </Link>
      </div>
    </div>
  );
}
