import {
  faCalendarAlt,
  faClock,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IMessage {
  id: string;
  group: string;
  from: string;
  message: string;
  date: string;
  hour: string;
}

export default function Message({
  id,
  group,
  from,
  message,
  date,
  hour,
}: IMessage) {
  const { t } = useLanguage();
  return (
    <li
      id={id}
      className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow"
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
      <p className="text-gray-700 font-medium mb-2">{t("message.message")}:</p>
      <p className="text-gray-600 leading-relaxed">{message}</p>
    </li>
  );
}
