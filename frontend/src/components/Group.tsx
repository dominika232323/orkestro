import { useLanguage } from "../LanguageContext";

interface IGroup {
  id: string;
  name: string;
  subGroups?: IGroup[];
}

export default function Group({ id, name, subGroups }: IGroup) {
  const { t } = useLanguage();
  return (
    <li className="bg-white p-4 rounded-lg shadow mb-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{name}</span>
        <div className="flex space-x-4">
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            title={`Manage ${name}`}
          >
            {t("group.manage")}
          </button>
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            title={`Manage ${name}`}
          >
            {t("group.events")}
          </button>
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            title={`Manage ${name}`}
          >
            {t("group.files")}
          </button>
        </div>
      </div>
      {subGroups && subGroups.length > 0 && (
        <ul className="pl-6 border-l-2 border-gray-300 mt-2 space-y-2">
          {subGroups.map((subGroup) => (
            <Group
              key={subGroup.id}
              id={subGroup.id}
              name={subGroup.name}
              subGroups={subGroup.subGroups}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
