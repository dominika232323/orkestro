import { useLanguage } from "../LanguageContext";
import { useCallback, useEffect, useState } from "react";
import MemberComponent from "../components/MemberComponent";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import {
  OrkestroGroup,
  OrkestroMember,
  OrkestroRole,
  OrkestroUser,
  Paged,
} from "../interfaces";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchUserOrRedirect } from "../auth";
import NewInvitation from "../components/NewInvitation";
import DeleteGroup from "../components/DeleteGroup";
import LeaveGroup from "../components/LeaveGroup";
import { getRole, parseId } from "../util";
import SearchBar from "../components/SearchBar";

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
  const [showLeaveGroup, setShowLeaveGroup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [group, setGroup] = useState<OrkestroGroup | null>(null);
  const [user, setUser] = useState<OrkestroUser>();
  const [role, setRole] = useState<OrkestroRole>();

  const parsedGroupId = parseId(groupId);
  const isManager = role ? role.is_manager : false;

  // Group fetching

  const fetchGroup = useCallback(async () => {
    await axios
      .get<OrkestroGroup>(`/api/groups/${groupId}`)
      .then((response) => setGroup(response.data))
      .catch((error) => console.error(error));
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Member fetching

  const fetchMembers = useCallback(async () => {
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
  }, [groupId, currentPage, roleFilter, searchQuery]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Fetching role

  const fetchRole = useCallback(() => getRole(setRole, groupId), [groupId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Fetch authenticated user

  useEffect(() => {
    fetchUserOrRedirect(navigate, setUser);
  }, [navigate]);

  // Toggling member search filter
  const toggleRoleFilter = (newFilter: string) => {
    setRoleFilter((prevFilter) => (prevFilter === newFilter ? "" : newFilter));
    setCurrentPage(1);
  };

  // Submit editing group's data
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

  // Change form's text fields
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
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("manage-group.title")}
        </h1>

        {/* Group's info */}
        <h2 className="text-xl font-bold text-center mb-6">
          {t("manage-group.manage-basics")}
        </h2>

        {/* Error and success messages */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        {/* Groups info form */}
        <form>
          <label>
            {t("new-event.name")}
            <input
              type="text"
              name="name"
              value={group.name}
              onChange={handleTextChange}
              className="block w-full p-2 border mb-2"
              disabled={!isManager}
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
              disabled={!isManager}
              required
            />
          </label>
        </form>

        <div className="flex flex-col space-y-2">
          {/* Row 1: Manager-only buttons */}
          {isManager && (
            <div className="flex space-x-2">
              {/* Submit group info edit */}
              <button
                onClick={submitTextChanges}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {t("manage-group.edit")}
              </button>

              {/* New subgroup */}
              <button
                onClick={() =>
                  navigate(`/new-group/${user?.user_id}/${group.group_id}`)
                }
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                <FontAwesomeIcon className="mr-1" icon={faPlus} />
                {t("manage-group.new-subgroup")}
              </button>

              {/* Delete group */}
              <button
                onClick={() => setShowDeleteGroup(true)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                disabled={loading}
              >
                {t("manage-group.delete-group")}
              </button>
            </div>
          )}

          {/* Row 2: Common buttons */}
          <div className="flex space-x-2">
            {isManager && (
              <button
                onClick={() => navigate(`/new-message/${group.group_id}`)}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t("group.new-message")}
              </button>
            )}
            <button
              onClick={() => navigate(`/events/${group.group_id}`)}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t("group.events")}
            </button>
            <button
              onClick={() => navigate(`/tracks/${group.group_id}`)}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t("group.tracks")}
            </button>
            {/* Leave group */}
            <button
              onClick={() => setShowLeaveGroup(true)}
              className="ml-1 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              disabled={loading}
            >
              {t("manage-group.leave-group")}
            </button>
          </div>

          {/* Member management */}
          <h2 className="text-xl font-bold text-center mb-6">
            {t("manage-group.manage-members")}
          </h2>

          {/* Search Bar */}
          <SearchBar
            query={searchQuery}
            onQueryChange={(value) => setSearchQuery(value)}
            onSearch={fetchMembers}
            placeholder={t("manage-group.search-placeholder")}
            setCurrentPage={setCurrentPage}
          />

          {/* Invite member */}
          {isManager && (
            <button
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center my-3"
              onClick={() => setShowInvite(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t("manage-group.invite")}
            </button>
          )}

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
              <MemberComponent
                key={member.user}
                member={member}
                reload={fetchMembers}
                isManager={isManager}
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

          {/* Invite window */}
          {showInvite && (
            <NewInvitation
              parsedGroupId={parsedGroupId}
              setShowInvite={setShowInvite}
            />
          )}

          {/* Delete group window */}
          {showDeleteGroup && (
            <DeleteGroup
              groupName={group.name}
              groupId={group.group_id}
              setShowDeleteGroup={setShowDeleteGroup}
            />
          )}

          {/* Leave group window */}
          {showLeaveGroup && groupId && user && (
            <LeaveGroup
              groupId={groupId}
              setShowLeaveGroup={setShowLeaveGroup}
            />
          )}
        </div>
      </div>
    );
  } else {
    return <p>Loading...</p>;
  }
}
