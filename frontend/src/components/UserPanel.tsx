import Invitations from "./Invitations";
import Groups from "./Groups";

export default function UserPanel() {
  return (
    <div className="space-y-8">
      <Invitations />
      <Groups />
    </div>
  );
}
