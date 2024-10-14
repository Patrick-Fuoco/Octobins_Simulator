// AppContext.js
import React, { createContext, useState } from "react";

// Create a Context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    // Define your global state here
    themeColor: "#C43527",
    totalpieces: {
      red: 1,
      blue: 0,
      white: 0,
      green: 0,
      yellow: 0,
      purple: 0,
      black: 0,
      pink: 0,
      grey: 0,
    },
    aoIntensity: 1,
    SelectedObject: "",
    showedit: true,
    canvas: "",
    chromaticAberrationOffset: [0.0008, 0.0008],
    placeorderbtn: "",
    cart: [],
    // Add more states as needed
  });

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  );
};
