import { useLanguage } from "../LanguageContext";
import Invitation from "./Invitation";

export default function Invitations() {
  const { t } = useLanguage();
  const invitations = ["Group 1", "Group 2"];
  // const invitations: string[] = [];
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("invitations.title")}
      </h1>
      {invitations.length > 0 ? (
        <ul className="space-y-4">
          {invitations.map((item) => (
            <Invitation key={item} text={item} />
          ))}
        </ul>
      ) : (
        <p>{t("invitations.no-invitations")}</p>
      )}
    </div>
  );
}
