import { useEffect, useRef, useState } from 'react';

export const CustomTitle = ({ type, index, customTitle, updateFunction }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(customTitle || '');
  const inputRef = useRef(null);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const saveTitle = () => {
    updateFunction(title);
    setEditingTitle(false);
  };

  useEffect(() => {
    if(editingTitle)
      inputRef.current.focus();
  }, [editingTitle])

  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-md font-bold">
        {type} {index && index}
        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
            className="ml-7 border rounded px-2 py-1"
            ref={inputRef}
          />
        ) : (
          <span className="ml-7 cursor-pointer" onClick={() => setEditingTitle(true)}>
            {customTitle || 'Custom Title Here'}
          </span>
        )}
      </h2>
    </div>
  );
};
