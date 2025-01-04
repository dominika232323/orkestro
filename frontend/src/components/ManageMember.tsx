import React, { useState } from "react";
import { Member, User } from "../interfaces";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface IMember {
  member: Member;
}

export default function ManageMember({ member }: IMember) {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  return (
    <div
      key={user?.user_id}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
    >
      <p>{user?.name}</p>
      <div className="flex items-center space-x-4">
        <select
          value={member.permission_level}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="manager">{t("manage-groups.roles.manager")}</option>
          <option value="musician">{t("manage-groups.roles.musician")}</option>
          <option value="moderator">
            {t("manage-groups.roles.moderator")}
          </option>
        </select>
        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}
