import { useLanguage } from "../LanguageContext";

export default function Calendar() {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("calendar.title")}
      </h1>
    </div>
  );
}
