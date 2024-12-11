import { useLanguage } from "../LanguageContext";

export default function Notifications() {
  const { t } = useLanguage();
  const notifications = [
    {
      id: 1,
      group: "Group 1",
      from: "Jan Kowalski",
      message:
        "Dzień dobry,\n 7.11 odbędzie się koncert.\nZ poważaniem, Jan Kowalski",
    },
    {
      id: 1,
      group: "Grupa",
      from: "Jan Kowalski",
      message:
        "Dzień dobry,\n 7.11 odbędzie się koncert.\nZ poważaniem, Jan Kowalski",
    },
  ];
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">{t("title")}</h1>
      <ul className="space-y-4">{}</ul>
    </div>
  );
}
