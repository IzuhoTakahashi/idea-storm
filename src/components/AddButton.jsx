import React from 'react';

function AddButton({ onClick }) {
  return (
    <button onClick={onClick} className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
      Add
    </button>
  );
}

export default AddButton;
