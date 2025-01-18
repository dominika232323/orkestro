import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { OrkestroUser } from "../interfaces";
import axios from "axios";

interface NewInvitationProps {
  parsedGroupId: number;
  setShowInvite: (arg0: boolean) => void;
}

export default function NewInvitation({
  parsedGroupId,
  setShowInvite,
}: NewInvitationProps) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

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
          permission_level: "A",
        };
        await axios.post(`/api/invitations/`, data);
        setSuccess(t("new-invitation.success"));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(t("new-invitation.-error"));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">{t("new-invitation.title")}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}
        <input
          type="text"
          name="email"
          value={email}
          placeholder={t("new-invitation.placeholder")}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleInvite}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {t("new-invitation.invite")}
        </button>
        <button
          onClick={() => setShowInvite(false)}
          className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          disabled={loading}
        >
          {t("edit-track.back")}
        </button>
      </div>
    </div>
  );
}
