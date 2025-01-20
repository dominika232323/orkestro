import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { OrkestroUser } from "../interfaces";
import axios from "axios";
import SubmitOrBack from "./SubmitOrBack";

interface NewInvitationProps {
  parsedGroupId: number;
  setShowInvite: (arg0: boolean) => void;
}

// Window to invite new member
export default function NewInvitation({
  parsedGroupId,
  setShowInvite,
}: NewInvitationProps) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  // Submit invite
  const submitInvite = async () => {
    setError("");
    setSuccess("");

    let user: OrkestroUser;

    try {
      const response = await axios.get<OrkestroUser>(
        `/api/users/by_email/?email=${email}`
      );
      user = response.data;
      try {
        const data = {
          user: user.user_id,
          group: parsedGroupId,
          permission_level: "C",
        };
        await axios.post(`/api/invitations/`, data);
        setSuccess(t("new-invitation.success"));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(t("new-invitation.error"));
        }
        console.error(err);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError(t("new-invitation.no-user"));
        }
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-6 px-2 sm:px-6 rounded-lg max-w-lg w-full">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">{t("new-invitation.title")}</h2>

        {/* Error or success messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        {/* Email input field */}
        <input
          type="text"
          name="email"
          value={email}
          placeholder={t("new-invitation.placeholder")}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Buttons */}
        <SubmitOrBack
          submitMethod={submitInvite}
          textSubmit={t("new-invitation.invite")}
          textSubmiting={t("new-invitation.inviting")}
          onCancel={() => setShowInvite(false)}
          textCancel={t("edit-track.back")}
        />
      </div>
    </div>
  );
}
