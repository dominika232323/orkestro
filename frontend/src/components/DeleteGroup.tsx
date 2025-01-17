import { useState } from "react";
import { useLanguage } from "../LanguageContext";

interface DeleteGroupProps {
  setShowDeleteGroup: (arg0: boolean) => void;
}

export default function DeleteGroup({ setShowDeleteGroup }: DeleteGroupProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">{t("delete-group.title")}</h2>
        <button
          onClick={() => setShowDeleteGroup(false)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          disabled={loading}
        >
          {t("delete-group.back")}
        </button>
      </div>
    </div>
  );
}
