import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface DeleteGroupProps {
  groupName: string;
  groupId: number;
  setShowDeleteGroup: (arg0: boolean) => void;
}

export default function DeleteGroup({
  groupName,
  groupId,
  setShowDeleteGroup,
}: DeleteGroupProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typedGroupName, setTypedGroupName] = useState("");

  const handleDelete = async () => {
    setError("");

    if (typedGroupName !== groupName) {
      setError(t("delete-group.name-mismatch"));
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/groups/${groupId}/`);
      navigate("/");
    } catch (err) {
      setError(t("delete-group.fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        <h2 className="text-lg font-bold mb-4">{t("delete-group.title")}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <p className="mb-4">{t("delete-group.description")}</p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="group-name"
            value={typedGroupName}
            onChange={(e) => setTypedGroupName(e.target.value)}
            placeholder={t("delete-group.placeholder")}
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex justify-between gap-4">
            <button
              onClick={handleDelete}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={loading}
            >
              {t("delete-group.delete")}
            </button>

            <button
              onClick={() => setShowDeleteGroup(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              disabled={loading}
            >
              {t("delete-group.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
