import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { axiosInstance as axios, fetchUserOrRedirect } from "../auth";
import GroupComponent from "./GroupComponent";
import {
  OrkestroGroup,
  OrkestroGroupWithSubgroups,
  OrkestroUser,
} from "../interfaces";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function Groups() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<OrkestroUser>();
  const [groups, setGroups] = useState<OrkestroGroupWithSubgroups[]>([]);

  useEffect(() => {
    async function fetchGroups() {
      await axios
        .get<OrkestroGroup[]>("/api/groups/me/")
        .then((response) => {
          const flatGroups: OrkestroGroup[] = response.data;

          // create a map of groups
          const groupMap: Record<number, OrkestroGroupWithSubgroups> = {};
          flatGroups.forEach((group) => {
            groupMap[group.group_id] = {
              group_id: group.group_id,
              name: group.name,
              description: group.description,
              subgroups: [],
            };
          });

          const groupHierarchy: OrkestroGroupWithSubgroups[] = [];
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

  useEffect(() => {
    fetchUserOrRedirect(setUser);
  }, []);

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("groups.title")}
      </h1>

      <button
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
        onClick={() => navigate(`/new-group/${user?.user_id}`)}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        {t("groups.add-group")}
      </button>

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
