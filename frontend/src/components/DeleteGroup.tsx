import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SubmitOrBack from "./SubmitOrBack";

interface DeleteGroupProps {
  groupName: string;
  groupId: number;
  setShowDeleteGroup: (arg0: boolean) => void;
}

// Window to delete group
export default function DeleteGroup({
  groupName,
  groupId,
  setShowDeleteGroup,
}: DeleteGroupProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [typedGroupName, setTypedGroupName] = useState("");

  // Submit delete group
  const submitDelete = async () => {
    setError("");

    if (typedGroupName !== groupName) {
      setError(t("delete-group.name-mismatch"));
      return;
    }
    try {
      await axios.delete(`/api/groups/${groupId}/`);
      navigate("/");
    } catch (err) {
      setError(t("delete-group.fail"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("delete-group.title")}</h2>

        {/* Show error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Delete prompt */}
        <p className="mb-4">{t("delete-group.description")}</p>

        {/* Confirm group name field */}
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

          {/* Buttons */}
          <SubmitOrBack
            submitMethod={submitDelete}
            textSubmit={t("delete-group.delete")}
            textSubmiting={t("delete-group.deleting")}
            colorSubmit="red"
            onCancel={() => setShowDeleteGroup(false)}
            textCancel={t("delete-group.back")}
          />
        </div>
      </div>
    </div>
  );
}
