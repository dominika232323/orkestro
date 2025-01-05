import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { GroupWithSubgroups } from "../interfaces";

interface Params {
  group: GroupWithSubgroups;
}

export default function GroupComponent({ group }: Params) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <li className="mt-3">
      <div className="flex justify-between items-center p-2 rounded-lg border-2 border-gray-300">
        <div>
          <p className="font-semibold text-lg">{group.name}</p>
          <p>{group.description}</p>
        </div>

        <div className="flex space-x-4">
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
              navigate(`/files/${group.group_id}`);
            }}
          >
            {t("group.files")}
          </button>
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              navigate(`/new-message/${group.group_id}`);
            }}
          >
            {t("group.new-message")}
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
