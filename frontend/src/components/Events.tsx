import { useLanguage } from "../LanguageContext";

export default function Events() {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("events.title")}
      </h1>
    </div>
  );
}
