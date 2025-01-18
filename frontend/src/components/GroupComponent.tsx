import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { OrkestroGroupWithSubgroups, OrkestroRole } from "../interfaces";
import { useEffect, useState } from "react";
import { fetchUserOrRedirect } from "../auth";
import axios from "axios";

interface Params {
  group: OrkestroGroupWithSubgroups;
}

export default function GroupComponent({ group }: Params) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<OrkestroRole>();

  useEffect(() => {
    const fetchRole = async () => {
      await axios
        .get<OrkestroRole>(`/api/groups/${group.group_id}/role/`)
        .then((response) => setRole(response.data))
        .catch((error) => console.error("Error fetching role:", error));
    };

    fetchRole();
  }, [group.group_id]);

  return (
    <li className="mt-3">
      <div className="flex justify-between items-center p-2 rounded-lg border-2 border-gray-300">
        <div>
          <p className="font-semibold text-lg">{group.name}</p>
          <p>{group.description}</p>
        </div>

        <div className="flex space-x-4">
          {(role?.is_manager || role?.is_moderator) && (
            <button
              className="text-sm text-blue-500 hover:text-blue-700"
              onClick={() => {
                navigate(`/new-message/${group.group_id}`);
              }}
            >
              {t("group.new-message")}
            </button>
          )}
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/manage-group/${group.group_id}`);
            }}
          >
            {t("group.manage")}
          </button>

          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/events/${group.group_id}`);
            }}
          >
            {t("group.events")}
          </button>

          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/tracks/${group.group_id}`);
            }}
          >
            {t("group.tracks")}
          </button>
        </div>
      </div>

      {group.subgroups && group.subgroups.length > 0 && (
        <ul className="ml-3 pl-3.5 border-l-2 border-gray-500 mt-2 space-y-4">
          {group.subgroups.map((subgroup) => (
            <GroupComponent key={subgroup.group_id} group={subgroup} />
          ))}
        </ul>
      )}
    </li>
  );
}
