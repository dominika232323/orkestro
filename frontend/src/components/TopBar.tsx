import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCog,
  faKey,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

interface TopBarProps {
  handleChangePage: (newPage: string) => void;
}

export default function TopBar({ handleChangePage }: TopBarProps) {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
      {/* Left Section - Icons */}
      <div className="flex items-center space-x-4">
        <div
          className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
          onClick={() => handleChangePage("user")}
        >
          <FontAwesomeIcon icon={faUser} />
        </div>
        <div
          className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
          onClick={() => handleChangePage("messages")}
        >
          <FontAwesomeIcon icon={faMessage} />
        </div>
        <div
          className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center"
          onClick={() => handleChangePage("calendar")}
        >
          <FontAwesomeIcon icon={faCalendarDays} />
        </div>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center space-x-6 text-sm">
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("events")}
        >
          {t("top-bar.events")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("music-files")}
        >
          {t("top-bar.music-files")}
        </button>
        <button
          className="hover:text-gray-700 font-medium"
          onClick={() => handleChangePage("group")}
        >
          {t("top-bar.group")}
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
        <button
          className="bg-gray-300 p-2 rounded-full hover:bg-gray-400"
          onClick={() => handleChangePage("settings")}
        >
          <FontAwesomeIcon icon={faCog} />
        </button>
        <button
          className="bg-gray-300 p-2 rounded-full hover:bg-gray-400"
          onClick={() => handleChangePage("key")}
        >
          <FontAwesomeIcon icon={faKey} />
        </button>
      </div>
    </div>
  );
}
