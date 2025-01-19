interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder: string; // Optional placeholder text
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  placeholder,
}: SearchBarProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex items-center mb-6 bg-white shadow-md rounded-lg overflow-hidden">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
    </div>
  );
}
