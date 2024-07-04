import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';

import useDebounce from '@/lib/useDebounce';

interface Props {
  setSearchQuery: (value: any) => void;
}

export const SearchField = ({ setSearchQuery }: Props) => {
  const [value, setValue] = useState('');
  const { debounce } = useDebounce();

  return (
    <div className="relative flex-1 lg:flex-none ml-7 lg:ml-0">
      <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary text-2xl" />
      <input
        type="text"
        placeholder="Search here"
        className="p-3 pl-12 w-full lg:w-[300px] text-sm leading-sm 
          text-primary appearance-none block border border-gray-300 shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-[#87C6E8] focus:border-[#87C6E8]"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debounce(() => setSearchQuery(e.target.value));
        }}
      />
    </div>
  );
};
