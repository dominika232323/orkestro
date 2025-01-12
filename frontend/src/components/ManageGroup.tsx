import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import ManageMember from "./ManageMember";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "./Pagination";
import { OrkestroMember, Paged } from "../interfaces";
import axios from "axios";

export default function ManageGroup() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMembers = async () => {
    setLoading(true);

    try {
      const response = await axios.get<Paged<OrkestroMember>>(
        `/api/members/search/?group_id=${groupId}&page=${currentPage}${roleFilter && `&permission_level=${roleFilter}`}${searchQuery && `&name=${searchQuery}`}`
      );

      setMembers(response.data.items);
      setCurrentPage(response.data.page_number);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentPage, roleFilter]);

  const toggleRoleFilter = (newFilter: string) => {
    setRoleFilter((prevFilter) => (prevFilter === newFilter ? "" : newFilter));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        {t("manage-group.title")}
      </h1>

      {/* Search Bar */}
      <div className="mb-6 flex items-center justify-between space-x-4">
        <div className="flex flex-1 items-center bg-white rounded-lg shadow-md overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("manage-group.search-placeholder")}
            className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchMembers}
            className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            {t("manage-group.search")}
          </button>
        </div>
      </div>

      {/* Role Filter Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        {["A", "C", "B"].map((role) => (
          <button
            key={role}
            className={`py-2 px-6 rounded-lg font-medium transition-colors ${
              roleFilter === role
                ? "bg-red-500 text-white"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
            onClick={() => toggleRoleFilter(role)}
          >
            {roleFilter === role
              ? t("manage-group.cancel-filter")
              : t(`manage-group.roles.${role}`)}
          </button>
        ))}
      </div>

      {/* Members List or Loading State */}
      {members && members.length > 0 ? (
        members.map((member) => (
          <ManageMember key={member.user} member={member} />
        ))
      ) : loading ? (
        <p className="text-gray-600 text-center">{t("manage-group.loading")}</p>
      ) : (
        <p className="text-gray-600 text-center">
          {t("manage-group.no-members")}
        </p>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
