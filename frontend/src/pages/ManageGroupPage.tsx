import { useLanguage } from "../LanguageContext";
import { useEffect, useState } from "react";
import ManageMember from "../components/ManageMember";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import {
  OrkestroGroup,
  OrkestroMember,
  OrkestroUser,
  Paged,
} from "../interfaces";
import axios, { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { axiosInstance, fetchUserOrRedirect } from "../auth";
import NewInvitation from "../components/NewInvitation";
import DeleteGroup from "../components/DeleteGroup";

export default function ManageGroupPage() {
  const { t } = useLanguage();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<OrkestroMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [group, setGroup] = useState<OrkestroGroup | null>(null);
  const [user, setUser] = useState<OrkestroUser>();

  const parsedGroupId = groupId ? parseInt(groupId, 10) : undefined;

  if (!parsedGroupId) throw new Error("Group ID invalid");

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

  const fetchGroup = async () => {
    await axios
      .get<OrkestroGroup>(`/api/groups/${groupId}`)
      .then((response) => setGroup(response.data));
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, roleFilter]);

  useEffect(() => {
    fetchUserOrRedirect(setUser);
  }, []);

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

  const submitTextChanges = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!group?.name || !group?.description) {
      setError(t("manage-group.edit-missing"));
      setLoading(false);
      return;
    }

    try {
      await axios.put(`/api/groups/${group.group_id}/`, group);
      setSuccess(t("manage-group.edit-success"));
    } catch (err) {
      setError(t("manage-group.edit-failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (group) {
      setGroup((prevData) => ({
        ...prevData!,
        [name]: value,
      }));
    }
  };

  if (group) {
    return (
      <div className="bg-gray-200 p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("manage-group.title")}
        </h1>

        <h2 className="text-xl font-bold text-center mb-6">
          {t("manage-group.manage-basics")}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        <label>
          {t("new-event.name")}
          <input
            type="text"
            name="name"
            value={group.name}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>

        <label>
          {t("new-event.description")}
          <input
            type="text"
            name="description"
            value={group.description}
            onChange={handleTextChange}
            className="block w-full p-2 border mb-2"
            required
          />
        </label>

        <div className="flex justify-between">
          <button
            onClick={submitTextChanges}
            className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {t("manage-group.edit")}
          </button>
          <button
            onClick={() =>
              navigate(`/new-group/${user?.user_id}/${group.group_id}`)
            }
            className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon className="mr-1" icon={faPlus} />
            {t("manage-group.new-subgroup")}
          </button>
          <button
            onClick={() => setShowDeleteGroup(true)}
            className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            disabled={loading}
          >
            {t("manage-group.delete-group")}
          </button>
        </div>

        <h2 className="text-xl font-bold text-center mb-6">
          {t("manage-group.manage-members")}
        </h2>

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

        {/* Invite member */}
        <button
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
          onClick={() => setShowInvite(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {t("manage-group.invite")}
        </button>

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
            <ManageMember
              key={member.user}
              member={member}
              reload={fetchMembers}
            />
          ))
        ) : loading ? (
          <p className="text-gray-600 text-center">
            {t("manage-group.loading")}
          </p>
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

        {showInvite && (
          <NewInvitation
            parsedGroupId={parsedGroupId}
            setShowInvite={setShowInvite}
          />
        )}

        {showDeleteGroup && (
          <DeleteGroup
            groupName={group.name}
            groupId={group.group_id}
            setShowDeleteGroup={setShowDeleteGroup}
          />
        )}
      </div>
    );
  } else {
    return <p>Loading...</p>;
  }
}
