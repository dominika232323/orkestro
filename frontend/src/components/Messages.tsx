import { useLanguage } from "../LanguageContext";
import Message from "./Message";

export default function Messages() {
  const { t } = useLanguage();
  const messages = [
    {
      id: "1",
      group: "Group 1",
      from: "Jan Kowalski",
      date: "28-10-2024",
      hour: "13:36",
      isConfirmed: false,
      message:
        "Dzień dobry,\n 7.11 odbędzie się koncert.\nZ poważaniem, Jan Kowalski",
    },
    {
      id: "2",
      group: "Grupa 2",
      from: "Piotr Nowak",
      date: "31-10-2024",
      hour: "21:36",
      isConfirmed: true,
      message:
        "Dzień dobry,\n 5.11 odbędzie się próba do koncertu. Przypominam o instrumentach i o wydrukowaniu nut.\n Z wyrazami szacunku, Piotr Nowak",
    },
  ];
  //   const messages: {
  //     id: string;
  //     group: string;
  //     from: string;
  //     message: string;
  //   }[] = [];
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("messages.title")}
      </h1>
      {messages.length > 0 ? (
        <ul className="space-y-4">
          {messages.map((notification) => (
            <Message
              id={notification.id}
              group={notification.group}
              from={notification.from}
              message={notification.message}
              date={notification.date}
              hour={notification.hour}
              isConfirmed={notification.isConfirmed}
            />
          ))}
        </ul>
      ) : (
        <p>{t("messages.no-messages")}</p>
      )}
    </div>
  );
}
