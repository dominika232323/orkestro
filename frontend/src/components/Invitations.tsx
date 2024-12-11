import LanguageProps from "../interfaces/LanguageProps";
import Invitation from "./Invitation";

export default function Invitations({
  handleLanguageChange,
  translationObject,
}: LanguageProps) {
  const invitations = ["Group 1", "Group 2"]; // Get invitations
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">User Invitations</h1>
      <ul className="space-y-4">
        {invitations.map((item) => (
          <Invitation key={item} text={item} />
        ))}
      </ul>
    </div>
  );
}
