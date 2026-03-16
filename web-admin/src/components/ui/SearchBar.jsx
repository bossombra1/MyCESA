import React, { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Rechercher...', debounceMs = 300 }) {
  const [value, setValue] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);

    setTimeoutId(id);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary transition"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary hover:scale-110 transition-all duration-200"
        >
          ✗
        </button>
      )}
    </div>
  );
}
