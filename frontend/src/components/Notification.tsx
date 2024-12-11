import { useLanguage } from "../LanguageContext";

interface INotification {
  id: string;
  group: string;
  from: string;
  message: string;
  date: string;
  hour: string;
}

export default function Notification({
  id,
  group,
  from,
  message,
  date,
  hour,
}: INotification) {
  const { t } = useLanguage();
  return (
    <li
      id={id}
      className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="mb-4">
        <p className="flex items-center text-gray-700 font-medium">
          <span className="mr-2 text-blue-500">
            <i className="fas fa-user"></i>
          </span>
          {t("notification.from")}:{" "}
          <span className="ml-1 font-semibold">{from}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-green-500">
            <i className="fas fa-users"></i>
          </span>
          {t("notification.group")}:{" "}
          <span className="ml-1 font-semibold">{group}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <i className="fas fa-calendar-alt"></i>
          </span>
          {t("notification.date")}:{" "}
          <span className="ml-1 font-semibold">{date}</span>
        </p>
        <p className="flex items-center text-gray-700 font-medium mt-2">
          <span className="mr-2 text-gray-500">
            <i className="fas fa-clock"></i>
          </span>
          {t("notification.hour")}:{" "}
          <span className="ml-1 font-semibold">{hour}</span>
        </p>
      </div>
      <p className="text-gray-700 font-medium mb-2">
        {t("notification.message")}:
      </p>
      <p className="text-gray-600 leading-relaxed">{message}</p>
    </li>
  );
}
