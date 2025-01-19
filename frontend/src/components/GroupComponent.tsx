import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { OrkestroGroupWithSubgroups, OrkestroRole } from "../interfaces";
import { useCallback, useEffect, useState } from "react";
import { getRole } from "../util";

interface Params {
  group: OrkestroGroupWithSubgroups;
}

// Element of Group list in Groups component
export default function GroupComponent({ group }: Params) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<OrkestroRole>();

  // Fetch users role
  const fetchRole = useCallback(
    () => getRole(setRole, group.group_id),
    [group.group_id]
  );

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return (
    <li className="mt-3">
      <div className="flex justify-between items-center p-2 rounded-lg border-2 border-gray-300">
        {/* Group info */}
        <div>
          <p className="font-semibold text-lg">{group.name}</p>
          <p>{group.description}</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex space-x-4">
          {/* New message */}
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

          {/* Manage group */}
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/manage-group/${group.group_id}`);
            }}
          >
            {t("group.manage")}
          </button>

          {/* Events */}
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/events/${group.group_id}`);
            }}
          >
            {t("group.events")}
          </button>

          {/* Tracks */}
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

      {/* List of subgroups */}
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
