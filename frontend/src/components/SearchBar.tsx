import { useEffect, useState } from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder: string;
  setCurrentPage: (page: number) => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  placeholder,
  setCurrentPage,
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);

  // Sync local and external query
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Reset page if query changed
  useEffect(() => {
    setCurrentPage(1);
  }, [localQuery, setCurrentPage]);

  // Handle entering new value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    onQueryChange(value); // Inform the parent component of the query change
  };

  return (
    <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
      <input
        type="text"
        value={localQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
