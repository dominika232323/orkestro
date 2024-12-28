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
import {MessageRecipient} from "../interfaces";


interface Params {
  message_recipient: MessageRecipient;
}

export default function MessageComponent({message_recipient}: Params) {
  const { t } = useLanguage();
  const [isRead, setIsRead] = useState(message_recipient.is_read);

  const handleConfirm = function () {
    setIsRead(true);
    // TODO: API request
  };

  return (
    <li
      id={String(message_recipient.message_recipient_id)}
      className={`p-6 rounded-lg shadow-md mb-4 border transition-shadow ${isRead ? "bg-white border-gray-200 hover:shadow-lg" : "bg-yellow-50 border-yellow-300 hover:shadow-lg"}`}
    >
      <div className="mb-4">
        <p className="flex items-center text-gray-700 font-medium">
          <span className="mr-2 text-blue-500">
            <FontAwesomeIcon icon={faUser} />
          </span>
          {t("message.from")}:{" "}
          <span className="ml-1 font-semibold">{message_recipient.message.user.name + " " + message_recipient.message.user.surname}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-green-500">
            <FontAwesomeIcon icon={faUsers} />
          </span>
          {t("message.group")}:{" "}
          <span className="ml-1 font-semibold">{message_recipient.message.group.name}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </span>
          {t("message.date")}:{" "}
          <span
            className="ml-1 font-semibold"
          >
            {message_recipient.message.date.toLocaleDateString(
              "pl-PL",
              {day: "2-digit", month: "2-digit", year: "numeric"}
            )}
          </span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <FontAwesomeIcon icon={faClock} />
          </span>
          {t("message.hour")}:{" "}
          <span
            className="ml-1 font-semibold"
          >
            {message_recipient.message.date.toLocaleTimeString("pl-PL")}
          </span>
        </p>
      </div>
      <p className="text-gray-700 font-bold mb-2">{message_recipient.message.title}</p>
      <p className="text-gray-600 leading-relaxed">{message_recipient.message.content}</p>
      {!isRead && (
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
