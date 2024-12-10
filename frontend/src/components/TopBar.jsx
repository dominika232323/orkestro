import React from "react";

export default function TopBar({ changeLanguage, translationObject }) {
  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
      {/* Left Section - Icons */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center">
          <i className="fas fa-user"></i>
        </div>
        <div className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center">
          <i className="fas fa-bell"></i>
        </div>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center space-x-6 text-sm">
        <button className="hover:text-gray-700 font-medium">
          {translationObject("top-bar.events")}
        </button>
        <button className="hover:text-gray-700 font-medium">
          {translationObject("top-bar.music-files")}
        </button>
        <button className="hover:text-gray-700 font-medium">
          {translationObject("top-bar.group")}
        </button>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select
            className="bg-white border border-gray-300 rounded-md text-sm p-1"
            onChange={handleLanguageChange}
          >
            <option value="pl">🇵🇱 Polski</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        <button className="bg-gray-300 p-2 rounded-full hover:bg-gray-400">
          <i className="fas fa-cog"></i>
        </button>
        <button className="bg-gray-300 p-2 rounded-full hover:bg-gray-400">
          <i className="fas fa-key"></i>
        </button>
      </div>
    </div>
  );
}
