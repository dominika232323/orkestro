import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import ManageMember from "./ManageMember";
import { useParams } from "react-router-dom";
import Pagination from "./Pagination";
import { Member } from "../interfaces";

export default function ManageGroup() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const fetchMembers = () => {
    setLoading(true);
    // TO DO
    // use groupId, searchString, currentPage and roleFilter, return list of IMembers (concatenate information from User class and Member class)
    // members can be searched by searchstring OR ROLE
    // use setMaxPage() to set amount of pages received from API
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [currentPage, roleFilter]);

  const toggleRoleFilter = (newFilter: string) => {
    if (roleFilter === newFilter) {
      setRoleFilter("");
    } else {
      setRoleFilter(newFilter);
    }
    fetchMembers();
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("manage-group.title")}
      </h1>

      <div className="mb-4 flex items-center space-x-4 justify-between">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("manage-group.search-placeholder")}
            className="flex-1 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={fetchMembers}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t("manage-group.search")}
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 rounded-lg font-medium ${
              roleFilter === "manager"
                ? "bg-red-500 text-white"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
            onClick={() => toggleRoleFilter("manager")}
          >
            {roleFilter === "manager"
              ? t("manage-group.cancel-filter")
              : t("manage-group.roles.manager")}
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
              ? t("manage-group.cancel-filter")
              : t("manage-group.roles.musician")}
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
              ? t("manage-group.cancel-filter")
              : t("manage-group.roles.moderator")}
          </button>
        </div>
      </div>

      {members.length > 0 ? (
        members.map((member) => <ManageMember member={member} />)
      ) : loading ? (
        <p className="text-gray-600 text-center">{t("manage-group.loading")}</p>
      ) : (
        <p className="text-gray-600 text-center">
          {t("manage-group.no-members")}
        </p>
      )}
      <Pagination
        currentPage={currentPage}
        maxPage={maxPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
