import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios } from "../auth";
import GroupComponent from "./GroupComponent";
import { Group, GroupWithSubgroups } from "../interfaces";

export default function Groups() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<GroupWithSubgroups[]>([]);

  useEffect(() => {
    async function fetchGroups() {
      await axios
        .get<Group[]>("/api/groups/me/")
        .then((response) => {
          const flatGroups: Group[] = response.data;

          // create a map of groups
          const groupMap: Record<number, GroupWithSubgroups> = {};
          flatGroups.forEach((group) => {
            groupMap[group.group_id] = {
              group_id: group.group_id,
              name: group.name,
              description: group.description,
              subgroups: [],
            };
          });

          const groupHierarchy: GroupWithSubgroups[] = [];
          flatGroups.forEach((group) => {
            if (group.supergroup) {
              // if the group has a supergroup, add it to the parent's subgroups
              groupMap[group.supergroup].subgroups.push(
                groupMap[group.group_id]
              );
            } else {
              // if the group has no supergroup, it is a top-level group
              groupHierarchy.push(groupMap[group.group_id]);
            }
          });

          setGroups(groupHierarchy);
        })
        .catch((error) => console.error("Error fetching invitations:", error));
    }

    fetchGroups();
  }, []);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("groups.title")}
      </h1>

      {groups && groups.length > 0 ? (
        <ul className="bg-white p-4 pt-2 rounded-lg space-y-6">
          {groups.map((group) => (
            <GroupComponent key={group.group_id} group={group} />
          ))}
        </ul>
      ) : (
        <p>{t("groups.no-groups")}</p>
      )}
    </div>
  );
}
