import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IInvitation {
  text: string;
}

export default function Invitation({ text }: IInvitation) {
  return (
    <li className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <p className="text-lg font-semibold">{text}</p>
      <div className="flex items-center gap-4">
        <button
          className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Accept"
        >
          <FontAwesomeIcon icon={faCheck} />
        </button>
        <button
          className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Reject"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </li>
  );
}
