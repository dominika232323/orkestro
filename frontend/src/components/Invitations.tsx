import { useEffect, useState } from "react";

import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import InvitationComponent from "./InvitationComponent";
import { OrkestroInvitation } from "../interfaces";

// Invitations section in main page
export default function Invitations() {
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState<OrkestroInvitation[]>([]);

  // Fetch active invitations
  const fetchInvitations = async () => {
    await axios
      .get<OrkestroInvitation[]>("/api/invitations/me/")
      .then((response) => setInvitations(response.data))
      .catch((error) => console.error("Error fetching invitations:", error));
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("invitations.title")}
      </h1>

      {/* List of invitations */}
      {invitations.length > 0 ? (
        <ul className="space-y-4">
          {invitations.map((inv) => (
            <InvitationComponent
              key={inv.invitation_id}
              invitation={inv}
              onActionComplete={fetchInvitations}
            />
          ))}
        </ul>
      ) : (
        <p>{t("invitations.no-invitations")}</p>
      )}
    </div>
  );
}
