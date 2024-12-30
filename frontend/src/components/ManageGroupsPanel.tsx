import { useLanguage } from "../LanguageContext";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface IUser {
  id: string;
  name: string;
  role: string;
}

interface IGroup {
  id: string;
  name: string;
  description: string;
  events: string[];
  files: string[];
  members: IUser[];
}

const initialGroups: IGroup[] = [
  {
    id: "1",
    name: "Group 1",
    description: "Description of group 1",
    events: ["Concert", "Rehearsal"],
    files: ["racer_x_technical_difficulties", "megadeth_holy_wars"],
    members: [
      { id: "1", name: "Jan Kowalski", role: "manager" },
      { id: "2", name: "Maciej Nowak", role: "musician" },
      { id: "3", name: "Aleksandra Marczak", role: "moderator" },
      { id: "4", name: "Szymon Brodowski", role: "musician" },
      { id: "5", name: "Błażej Zwoliński", role: "musician" },
      { id: "6", name: "Piotr Wróblewski", role: "moderator" },
    ],
  },
  {
    id: "2",
    name: "Group 2",
    description: "Description of Group 2",
    events: ["Practice"],
    files: ["lady_pank_mala_wojna"],
    members: [
      { id: "7", name: "Jan Kowalski", role: "manager" },
      { id: "8", name: "Łukasz Jagnieża", role: "musician" },
    ],
  },
  {
    id: "3",
    name: "Group 3",
    description: "Description of Group 3",
    events: [],
    files: [],
    members: [],
  },
];

export default function ManageGroupsPanel() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState(initialGroups);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(1);
  const [groupName, setGroupName] = useState(groups[0].name);
  const [groupDescription, setGroupDescription] = useState(
    groups[0].description
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const membersPerPage = 5;
  const currentGroup = groups[currentGroupIndex];

  const handlePrevGroup = () => {
    const newIndex = (currentGroupIndex - 1 + groups.length) % groups.length;
    setCurrentGroupIndex(newIndex);
    setGroupName(groups[newIndex].name);
    setGroupDescription(groups[newIndex].description);
    setSearchQuery("");
    setRoleFilter(null);
    setCurrentPage(1);
  };

  const handleNextGroup = () => {
    const newIndex = (currentGroupIndex + 1) % groups.length;
    setCurrentGroupIndex(newIndex);
    setGroupName(groups[newIndex].name);
    setGroupDescription(groups[newIndex].description);
    setSearchQuery("");
    setRoleFilter(null);
    setCurrentPage(1);
  };

  const handleSaveChanges = () => {
    groups[currentGroupIndex].name = groupName;
    groups[currentGroupIndex].description = groupDescription;
    alert(t("manage-groups.changes-saved"));
  };

  const handleDeleteMember = (id: string) => {
    const updatedGroups = [...groups];
    updatedGroups[currentGroupIndex].members = updatedGroups[
      currentGroupIndex
    ].members.filter((member) => member.id !== id);
    setGroups(updatedGroups);
    setCurrentPage(0);
  };

  const handleRoleChange = (id: string, newRole: string) => {
    const updatedGroups = [...groups];
    const member = updatedGroups[currentGroupIndex].members.find(
      (member) => member.id === id
    );
    if (member) member.role = newRole;
    setGroups(updatedGroups);
  };

  const toggleRoleFilter = (role: string) => {
    setRoleFilter((current) => (current === role ? null : role));
    setCurrentPage(0);
  };

  // Filter members by name and role
  const filteredMembers = currentGroup.members.filter((member) => {
    const matchesName = member.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? member.role === roleFilter : true;
    return matchesName && matchesRole;
  });

  // Paginate the filtered members
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * membersPerPage,
    currentPage * membersPerPage
  );

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        {t("manage-groups.title")}
      </h1>
      <div className="flex justify-between items-center mb-6">
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handlePrevGroup}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-xl font-bold">{currentGroup.name}</h1>
        <button
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={handleNextGroup}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-4 justify-center">
        <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          {t("manage-groups.messages")}
        </button>
        <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          {t("manage-groups.send-messages")}
        </button>
      </div>

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

      {filteredMembers.length > 0 ? (
        paginatedMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200 mb-2"
          >
            <p>{member.name}</p>
            <div className="flex items-center space-x-4">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="manager">
                  {t("manage-groups.roles.manager")}
                </option>
                <option value="musician">
                  {t("manage-groups.roles.musician")}
                </option>
                <option value="moderator">
                  {t("manage-groups.roles.moderator")}
                </option>
              </select>
              <button
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => handleDeleteMember(member.id)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">
          {t("manage-groups.no-members")}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {t("manage-groups.previous")}
          </button>
          <span className="self-center font-medium">
            {t("manage-groups.page")} {currentPage} / {totalPages}
          </span>
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            {t("manage-groups.next")}
          </button>
        </div>
      )}
    </div>
  );
}
