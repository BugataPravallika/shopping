import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();

  // FIX: uncontrolled input - urlKeyword may be undefined
  const [keyword, setKeyword] = useState(urlKeyword || '');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword) {
      navigate(`/search/${keyword.trim()}`);
      setKeyword('');
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} className="relative flex items-center">
      <input
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search Products...'
        className="w-full sm:w-64 pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all text-sm bg-gray-50 focus:bg-white"
      />
      <button type='submit' className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-accent transition-colors">
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBox;
