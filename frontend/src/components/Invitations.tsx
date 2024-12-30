import {useEffect, useState} from "react";

import { useLanguage } from "../LanguageContext";
import {axiosInstance as axios, fetchUserOrRedirect} from "../auth";
import InvitationComponent from "./InvitationComponent";
import {Invitation} from "../interfaces";


export default function Invitations() {
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    fetchUserOrRedirect();
  }, []);

  useEffect(() => {
    const fetchInvitations = async () => {
      await axios.get<Invitation[]>("/api/invitations/me/")
        .then((response) => {
          setInvitations(response.data);
        })
        .catch((error) => console.error("Error fetching invitations:", error));
    };

    fetchInvitations();
  }, []);

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("invitations.title")}
      </h1>
      {invitations.length > 0 ?
        <ul className="space-y-4">
          {invitations.map((inv) => (
            <InvitationComponent key={inv.invitation_id} invitation={inv}/>
          ))}
        </ul>
        :
        <p>{t("invitations.no-invitations")}</p>
      }
    </div>
  );
}
