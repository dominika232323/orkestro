import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {axiosInstance as axios} from "../auth";
import {Invitation} from "../interfaces";


interface Params {
  invitation: Invitation;
  onActionComplete: () => void;
}

export default function InvitationComponent({invitation, onActionComplete}: Params) {
  const handleAccept = async () => {
    await axios.post(`/api/invitations/${invitation.invitation_id}/accept/`)
    .then(() => {
      console.log(`Successfully accepted invitation ${invitation.invitation_id}`);
      onActionComplete();
    })
    .catch((error) => console.error(`Error accepting invitation ${invitation.invitation_id}:`, error));
  }

  const handleReject = async () => {
    await axios.post(`/api/invitations/${invitation.invitation_id}/reject/`)
    .then(() => {
      console.log(`Successfully rejected invitation ${invitation.invitation_id}`);
      onActionComplete();
    })
    .catch((error) => console.error(`Error rejecting invitation ${invitation.invitation_id}:`, error));
  }

  return (
    <li
      id={String(invitation.invitation_id)}
      className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
    >
      <div>
        <p className="text-lg font-semibold mb-1">{invitation.group_details.name}</p>
        <p>{invitation.group_details.description}</p>
      </div>
      <div className="flex items-center gap-4">
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
