import React, { useContext, useEffect, useState } from "react";
import { MatchContext } from "../../../createContext/Match/MatchContext";
import IsAuth from "../../../createContext/is-Auth/IsAuthContext";
import TeamIcon1 from "../../images/TeamIcon1.png";
import TeamIcon2 from "../../images/TeamIcon2.png";
import MatchCard from "../../RightSidebar/MatchCard";

const SearchDropdown = ({
  type,
  placeholder,
  onSelect,
  icon,
  isCustom = false,
  isMultiple = false,
  }) => {

   
  
  const [options , setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const {sports , players} = useContext(MatchContext);
  const {matches} = useContext(MatchContext);
  const {user} = useContext(IsAuth);

  useEffect(() => {
    console.log(matches)
    if (type === "sports"){
      setOptions(sports);
    }
    else if (type === "players" || type === "player"){
      setOptions(players);
    }
    else if (type === "matches"){
      const today = new Date();
      const relevantMatches = matches.filter(match => 
        match.admins.includes(user._id) &&
        match.status === "scheduled" &&
        new Date(match.date) < today
      );
      setOptions(relevantMatches);
    }
  },[type])


  const handleSearchChange = async(e) => {
    setIsOpen(true);
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = options.filter((option) =>
      option.name?.toLowerCase().includes(value.toLowerCase())
    );
    if (isCustom && filtered.length === 0) {
      setIsOpen(false);
    }
    setFilteredOptions(filtered);
  };

  const handleOptionClick = (option) => {
    if (isMultiple) {
      if (!selectedOptions.includes(option)) {
        const newSelectedOptions = [...selectedOptions, option];
        setSelectedOptions(newSelectedOptions);
        setSearchTerm(""); // Clear search term for next selection
        if (onSelect) onSelect(newSelectedOptions);
      }
    } else {
      setSelectedOptions([option]); // Keep in array format for consistency
      setSearchTerm(option.name);
      if (onSelect) onSelect(option);
    }
    setIsOpen(false);
  };

  

  const handleRemoveSelected = (option) => {
    const newSelectedOptions = selectedOptions.filter(
      (selected) => selected !== option
    );
    setSelectedOptions(newSelectedOptions);
    if (onSelect) onSelect(isMultiple ? newSelectedOptions : null);
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2">
        {/* Selected Options Display */}
        {isMultiple && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
              >
                <span>{option.name}</span>
                <button
                  onClick={() => handleRemoveSelected(option)}
                  className="text-gray-500 hover:text-gray-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Search Input */}
        <div className="flex gap-1">
          <span className="my-auto text-black" aria-hidden="true">
            {icon}
          </span>
          <input
            type="text"
            placeholder={selectedOptions.length === 0 ? placeholder : "Add more..."}
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow w-fit rounded-lg border border-[#333] py-2 px-2.5 text-base"
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-md z-50">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <p
                key={index}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-base ${
                  selectedOptions.includes(option) ? "bg-gray-50 text-gray-500" : ""
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option.name}
              </p>
            ))
          ) : (
            <p className="px-3 py-2 text-center text-gray-500">
              No results found
            </p>
          )}
        </div>
      )}
      {type === 'matches' && selectedOptions.length > 0 && 
        <div className="ml-5 mt-3  items-center -mb-5"><MatchCard
        type={selectedOptions[0].isTeamMatch ? "Team" : "1 on 1"}
        location={selectedOptions[0].location}
        team1={{ 
          name: selectedOptions[0].isTeamMatch ? selectedOptions[0].teams[0].team.name : selectedOptions[0].players[0].userName, 
          logo: selectedOptions[0].isTeamMatch ? TeamIcon1 : selectedOptions[0].players[0].avatar 
        }}
        team2={{ 
          name: selectedOptions[0].isTeamMatch ? selectedOptions[0].teams[1].team.name : selectedOptions[0].players[1].userName, 
          logo: selectedOptions[0].isTeamMatch ? TeamIcon2 : selectedOptions[0].players[1].avatar 
        }}
        date={new Date(selectedOptions[0].date).toLocaleString()}
      />
      </div>}
    </div>
  );
};

export default SearchDropdown;