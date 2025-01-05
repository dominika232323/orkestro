import React from "react";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Member } from "../interfaces";

interface ManageMemberProps {
  member: Member;
}

export default function ManageMember({ member }: ManageMemberProps) {
  const { t } = useLanguage();

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {};

  const handleDelete = () => {};

  return (
    <div
      key={member.user_id}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
    >
      <p>{member.name}</p>
      <div className="flex items-center space-x-4">
        <select
          value={member.role}
          onSelect={handleRoleChange}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="manager">{t("manage-groups.roles.manager")}</option>
          <option value="musician">{t("manage-groups.roles.musician")}</option>
          <option value="moderator">
            {t("manage-groups.roles.moderator")}
          </option>
        </select>
        <button
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={handleDelete}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}
