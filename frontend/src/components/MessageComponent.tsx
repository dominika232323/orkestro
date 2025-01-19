import {
  faCalendarAlt,
  faClock,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { axiosInstance as axios } from "../auth";
import { OrkestroMessageRecipient } from "../interfaces";

interface Params {
  message_recipient: OrkestroMessageRecipient;
}

// Element of Message list in Messages Page
export default function MessageComponent({ message_recipient }: Params) {
  const { t } = useLanguage();
  const [isRead, setIsRead] = useState(message_recipient.is_read);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle confirming reading the message
  const handleToggleRead = async () => {
    if (!isRead) {
      setIsRead(true);
      await axios
        .post(
          `/api/message-recipients/${message_recipient.message_recipient_id}/mark_as_read/`
        )
        .catch((error) =>
          console.error(
            `Error confirming message recipient ${message_recipient.message_recipient_id}:`,
            error
          )
        );
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <li
      id={String(message_recipient.message_recipient_id)}
      onClick={handleToggleRead}
      className={`p-4 rounded-lg shadow-md mb-4 border transition-shadow cursor-pointer ${
        isRead
          ? "bg-white border-gray-200 hover:shadow-lg"
          : "bg-yellow-50 border-yellow-300 hover:shadow-lg"
      }`}
    >
      {!isExpanded ? (
        // Not expanded message
        <div className="flex justify-between text-gray-700">
          {/* Message data */}
          <div>
            <p>
              {message_recipient.message_details.user_details.name}{" "}
              {message_recipient.message_details.user_details.surname}
              {" → "}
              {message_recipient.message_details.group_details.name}
            </p>
            <p className="font-bold">
              {message_recipient.message_details.title}
            </p>
          </div>

          {/* Message date and time */}
          <div>
            {message_recipient.message_details.date.toLocaleDateString(
              "pl-PL",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}{" "}
            {message_recipient.message_details.date.toLocaleTimeString("pl-PL")}
          </div>
        </div>
      ) : (
        // Expanded message
        <div className="flex flex-col">
          {/* More message data */}
          <div>
            <p className="text-gray-700 font-medium">
              <span className="mr-2 text-blue-500">
                <FontAwesomeIcon icon={faUser} />
              </span>
              {t("message.from")}:{" "}
              {message_recipient.message_details.user_details.name}{" "}
              {message_recipient.message_details.user_details.surname}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="mr-2 text-green-500">
                <FontAwesomeIcon icon={faUsers} />
              </span>
              {t("message.group")}:{" "}
              {message_recipient.message_details.group_details.name}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </span>
              {t("message.date")}:{" "}
              {message_recipient.message_details.date.toLocaleDateString(
                "pl-PL",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="mr-2 text-gray-500">
                <FontAwesomeIcon icon={faClock} />
              </span>
              {t("message.hour")}:{" "}
              {message_recipient.message_details.date.toLocaleTimeString(
                "pl-PL"
              )}
            </p>
          </div>

          {/* Message title */}
          <p className="text-gray-700 font-bold mt-2">
            {message_recipient.message_details.title}
          </p>

          {/* Message content */}
          <p className="mt-4 text-gray-600 leading-relaxed">
            {message_recipient.message_details.content}
          </p>
        </div>
      )}
    </li>
  );
}
