import React, { createContext, useState, useContext } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [code, setCode] = useState('');
  const [drawing, setDrawing] = useState('');

  return (
    <EditorContext.Provider value={{ code, setCode, drawing, setDrawing }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
