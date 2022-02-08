import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';

export default function GlobalFilter({ filter, setFilter }) {
  const [value, setValue] = useState(filter);
  const onChange = useAsyncDebounce((value) => {
    setFilter(value || undefined);
  }, 1000);
  return (
    <div className="table__search">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="search..."
      />
      <i className="bx bx-search"></i>
    </div>
  );
}
