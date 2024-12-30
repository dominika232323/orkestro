import { useLanguage } from "../LanguageContext";
import GroupComponent from "./GroupComponent";

export default function Groups() {
  const { t } = useLanguage();
  const groups = [
    {
      id: "1",
      name: "Group A",
      subGroups: [
        {
          id: "1-1",
          name: "Sub-Group A1",
          subGroups: [
            { id: "1-1-1", name: "Sub-Sub-Group A1-1" },
            {
              id: "1-1-2",
              name: "Sub-Sub-Group A1-2",
              subGroups: [{ id: "1-1-2-1", name: "Sub-Sub-Sub-Group" }],
            },
          ],
        },
        { id: "1-2", name: "Sub-Group A2" },
      ],
    },
    {
      id: "2",
      name: "Group B",
      subGroups: [{ id: "2-1", name: "Sub-Group B1" }],
    },
  ];

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("invitations-and-groups.title")}
      </h1>
      <ul className="space-y-4">
        {groups.map((group) => (
          <GroupComponent
            key={group.id}
            id={group.id}
            name={group.name}
            subGroups={group.subGroups}
          />
        ))}
      </ul>
    </div>
  );
}
