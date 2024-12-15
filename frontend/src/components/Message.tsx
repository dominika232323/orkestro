import {
  faCalendarAlt,
  faClock,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import HoverText from "./HoverText";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface IMessage {
  id: string;
  group: string;
  from: string;
  title: string;
  message: string;
  date: string;
  hour: string;
  isConfirmed: boolean;
}

export default function Message({
  id,
  group,
  from,
  message,
  title,
  date,
  hour,
  isConfirmed,
}: IMessage) {
  const { t } = useLanguage();
  const [isConfirmedState, confirm] = useState(isConfirmed);

  const handleConfirm = function () {
    confirm(true);
  };

  return (
    <li
      id={id}
      className={`p-6 rounded-lg shadow-md mb-4 border transition-shadow ${isConfirmedState ? "bg-white border-gray-200 hover:shadow-lg" : "bg-yellow-50 border-yellow-300 hover:shadow-lg"}`}
    >
      <div className="mb-4">
        <p className="flex items-center text-gray-700 font-medium">
          <span className="mr-2 text-blue-500">
            <FontAwesomeIcon icon={faUser} />
          </span>
          {t("message.from")}:{" "}
          <span className="ml-1 font-semibold">{from}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-green-500">
            <FontAwesomeIcon icon={faUsers} />
          </span>
          {t("message.group")}:{" "}
          <span className="ml-1 font-semibold">{group}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </span>
          {t("message.date")}:{" "}
          <span className="ml-1 font-semibold">{date}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <FontAwesomeIcon icon={faClock} />
          </span>
          {t("message.hour")}:{" "}
          <span className="ml-1 font-semibold">{hour}</span>
        </p>
      </div>
      <p className="text-gray-700 font-bold mb-2">{title}</p>
      <p className="text-gray-600 leading-relaxed">{message}</p>
      {!isConfirmedState && (
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <HoverText textToShow={t("message.hover-text")}>
            <FontAwesomeIcon icon={faCheck} />
          </HoverText>
        </button>
      )}
    </li>
  );
}
