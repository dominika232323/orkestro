import Invitations from "./Invitations";
import Groups from "./Groups";

// What to render on main page
export default function InvitationsAndGroups() {
  return (
    <div className="space-y-8">
      <Invitations />
      <Groups />
    </div>
  );
}
