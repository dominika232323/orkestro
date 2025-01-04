import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import { User } from "../interfaces";
import Member from "./Member";
import { useParams } from "react-router-dom";
import SwitchPagesComponent from "./SwitchPagesComponent";

export default function ManageGroup() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = () => {
    // TO DO
  };

  const toggleRoleFilter = (newFilter: string) => {
    if (roleFilter === newFilter) {
      setRoleFilter("");
    } else {
      setRoleFilter(newFilter);
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("manage-groups.title")}
      </h1>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("manage-groups.search-placeholder")}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            roleFilter === "manager"
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
          onClick={() => toggleRoleFilter("manager")}
        >
          {roleFilter === "manager"
            ? t("manage-groups.cancel-filter")
            : t("manage-groups.roles.manager")}
        </button>
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            roleFilter === "musician"
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
          onClick={() => toggleRoleFilter("musician")}
        >
          {roleFilter === "musician"
            ? t("manage-groups.cancel-filter")
            : t("manage-groups.roles.musician")}
        </button>
        <button
          className={`py-2 px-4 rounded-lg font-medium ${
            roleFilter === "moderator"
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
          onClick={() => toggleRoleFilter("moderator")}
        >
          {roleFilter === "moderator"
            ? t("manage-groups.cancel-filter")
            : t("manage-groups.roles.moderator")}
        </button>
      </div>

      {members.length > 0 ? (
        members.map((member) => <Member />)
      ) : (
        <p className="text-gray-600 text-center">
          {t("manage-groups.no-members")}
        </p>
      )}
      <SwitchPagesComponent />
    </div>
  );
}
