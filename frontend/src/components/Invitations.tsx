import LanguageProps from "../interfaces/LanguageProps";
import Invitation from "./Invitation";

export default function Invitations({
  handleLanguageChange,
  translationObject,
}: LanguageProps) {
  const invitations = ["Group 1", "Group 2"];
  return (
    <div className="bg-gray-400">
      <h1 className="text-3xl text-center">User Invitations</h1>
      <ol>
        {invitations.map((item) => (
          <Invitation text={item} />
        ))}
      </ol>
    </div>
  );
}
