import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SubmitOrBack from "./SubmitOrBack";

// Window to leave group
interface LeaveGroupProps {
  groupId: string;
  setShowLeaveGroup: (arg0: boolean) => void;
}

export default function LeaveGroup({
  groupId,
  setShowLeaveGroup,
}: LeaveGroupProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  // Submit leaving the group
  const submitLeave = async () => {
    await axios
      .post(`/api/members/leave/`, { group: groupId })
      .then(() => navigate("/"))
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400) {
            setError(t("leave-group.last-manager"));
            return;
          }
        }
        setError(t("leave-group.error"));
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-6 px-2 sm:px-6 rounded-lg max-w-lg w-full shadow-lg">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("leave-group.title")}</h2>
        <p className="mb-4">{t("leave-group.description")}</p>

        {/* Show error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Buttons */}
        <SubmitOrBack
          submitMethod={submitLeave}
          textSubmit={t("leave-group.leave")}
          textSubmiting={t("leave-group.leaving")}
          colorSubmit="red"
          onCancel={() => setShowLeaveGroup(false)}
          textCancel={t("leave-group.back")}
        />
      </div>
    </div>
  );
}
