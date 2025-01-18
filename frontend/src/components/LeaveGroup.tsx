import { useState } from "react";
import { useLanguage } from "../LanguageContext";

interface LeaveGroupProps {
  groupId: string;
  userId: number;
  setShowLeaveGroup: (arg0: boolean) => void;
}

export default function LeaveGroup({
  groupId,
  userId,
  setShowLeaveGroup,
}: LeaveGroupProps) {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {};

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        <h2 className="text-lg font-bold mb-4">{t("leave-group.title")}</h2>
        <p className="mb-4">{t("leave-group.description")}</p>

        <button
          onClick={handleLeave}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {t("leave-group.leave")}
        </button>

        <button
          onClick={() => setShowLeaveGroup(false)}
          className="ml-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          disabled={loading}
        >
          {t("leave-group.back")}
        </button>
      </div>
    </div>
  );
}
