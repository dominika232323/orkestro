import React from "react";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { OrkestroMember } from "../interfaces";

interface ManageMemberProps {
  member: OrkestroMember;
}

export default function ManageMember({ member }: ManageMemberProps) {
  const { t } = useLanguage();

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {};

  const handleDelete = () => {};

  return (
    <div
      key={member.user}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
    >
      <p>{member.user_details.name + " " + member.user_details.surname}</p>
      <div className="flex items-center space-x-4">
        <select
          value={member.permission_level}
          onSelect={handleRoleChange}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="A">{t("manage-group.roles.A")}</option>
          <option value="C">{t("manage-group.roles.C")}</option>
          <option value="B">{t("manage-group.roles.B")}</option>
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
