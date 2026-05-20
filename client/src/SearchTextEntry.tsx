import React, { useState } from 'react';

interface SearchTextEntryProps {
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void;
}

const SearchTextEntry: React.FC<SearchTextEntryProps> = ({ onSearch, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-text-entry">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); onChange?.(e.target.value); }}
        onKeyPress={handleKeyPress}
        placeholder="Search jobs..."
        className="search-input"
      />
      <button
        onClick={handleSearch}
        className="search-button"
      >
        Search
      </button>
    </div>
  );
};

export default SearchTextEntry;
