import React, { useState } from 'react';

interface SearchTextEntryProps {
  onSearch?: (query: string) => void;
  className?: string;
  resultCount?: number;
}

const SearchTextEntry: React.FC<SearchTextEntryProps> = ({ onSearch, className = '', resultCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchHovered, setIsSearchHovered] = useState(false);

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
    <div className={`search-text-entry ${className}`.trim()}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); }}
        onKeyPress={handleKeyPress}
        placeholder="Search jobs..."
        className="search-input"
      />
      <button
        onClick={handleSearch}
        className="search-button"
        onMouseEnter={() => setIsSearchHovered(true)}
        onMouseLeave={() => setIsSearchHovered(false)}
      >
        Search
      </button>
      {isSearchHovered && resultCount > 0 && (
        <div className="search-button-results-popover" role="status" aria-live="polite">
          {resultCount} results in search
        </div>
      )}
    </div>
  );
};

export default SearchTextEntry;
