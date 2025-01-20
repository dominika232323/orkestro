import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { axiosInstance as axios } from "../auth";
import { OrkestroInvitation } from "../interfaces";
import { useNavigate } from "react-router-dom";

interface Params {
  invitation: OrkestroInvitation;
  onActionComplete: () => void;
}

// Element of Invitation list in Invitations
export default function InvitationComponent({
  invitation,
  onActionComplete,
}: Params) {
  const navigate = useNavigate();

  // Accepting invitation
  const handleAccept = async () => {
    await axios
      .post(`/api/invitations/${invitation.invitation_id}/accept/`)
      .then(() => {
        navigate(`/manage-group/${invitation.group}`);
      })
      .catch((error) =>
        console.error(
          `Error accepting invitation ${invitation.invitation_id}:`,
          error
        )
      );
  };

  // Rejecting invitation
  const handleReject = async () => {
    await axios
      .post(`/api/invitations/${invitation.invitation_id}/reject/`)
      .then(() => {
        onActionComplete();
      })
      .catch((error) =>
        console.error(
          `Error rejecting invitation ${invitation.invitation_id}:`,
          error
        )
      );
  };

  return (
    <li
      id={String(invitation.invitation_id)}
      className="bg-white py-4 px-3 sm:px-4 rounded-lg shadow flex items-center justify-between"
    >
      {/* Invitation info */}
      <div>
        <p className="text-lg font-semibold mb-1">
          {invitation.group_details.name}
        </p>
        <p>{invitation.group_details.description}</p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Accept"
          onClick={handleAccept}
        >
          <FontAwesomeIcon icon={faCheck} />
        </button>
        <button
          className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Reject"
          onClick={handleReject}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </li>
  );
}
