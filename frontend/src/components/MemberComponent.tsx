import React, { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { OrkestroMember } from "../interfaces";
import axios from "axios";

interface ManageMemberProps {
  member: OrkestroMember;
  reload: () => void;
  isManager: boolean;
}

export default function MemberComponent({
  member,
  reload,
  isManager,
}: ManageMemberProps) {
  const { t } = useLanguage();

  const [deleting, setDeleting] = useState(false);

  const handleRoleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    try {
      await axios.put(`/api/members/${member.member_id}/`, {
        ...member,
        permission_level: event.target.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      reload();
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/members/${member.member_id}/`);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
      reload();
    }
  };

  return (
    <div
      key={member.user}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
    >
      <p>{member.user_details.name + " " + member.user_details.surname}</p>
      <div className="flex items-center space-x-4">
        <select
          value={member.permission_level}
          onChange={handleRoleChange}
          className="p-2 border border-gray-300 rounded-lg"
          disabled={!isManager}
        >
          <option value="A">{t("manage-group.roles.A")}</option>
          <option value="C">{t("manage-group.roles.C")}</option>
          <option value="B">{t("manage-group.roles.B")}</option>
        </select>
        {isManager && (
          <button
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={handleDelete}
            disabled={deleting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
}
