import { useLanguage } from "../LanguageContext";
import {GroupWithSubgroups} from "../interfaces";


interface Params {
  group: GroupWithSubgroups
}

export default function GroupComponent({ group }: Params) {
  const { t } = useLanguage();
  return (
    <li className="bg-white p-4 rounded-lg shadow mb-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{group.name}</span>
        <div className="flex space-x-4">
          <button className="text-sm text-blue-500 hover:text-blue-700">
            {t("group.manage")}
          </button>
          <button className="text-sm text-blue-500 hover:text-blue-700">
            {t("group.events")}
          </button>
          <button className="text-sm text-blue-500 hover:text-blue-700">
            {t("group.files")}
          </button>
        </div>
      </div>

      {group.subgroups && group.subgroups.length > 0 && (
        <ul className="pl-6 border-l-2 border-gray-300 mt-2 space-y-2">
          {group.subgroups.map((subgroup) => (
            <GroupComponent
              key={subgroup.group_id}
              group={subgroup}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
