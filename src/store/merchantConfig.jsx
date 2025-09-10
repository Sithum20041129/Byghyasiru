// src/store/merchantConfig.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { nanoid } from "nanoid";

const MerchantConfigContext = createContext();

const defaultConfig = {
  mealTimes: ["Breakfast", "Lunch", "Dinner"],
  activeMealTime: "Lunch",
  defaultVegCount: 2,
  extraVegPrice: 50,

  // ✅ Universities
  availableUniversities: [
    { id: "uoc", name: "University of Colombo" },
    { id: "uok", name: "University of Kelaniya" },
    { id: "uom", name: "University of Moratuwa" },
    { id: "ousl", name: "Open University of Sri Lanka" },
  ],
  universities: [], // merchant-selected

  // ✅ Portion categories
  portions: [
    { id: nanoid(), name: "Full", multiplier: 1 },
    { id: nanoid(), name: "Half", multiplier: 0.5 },
    { id: nanoid(), name: "Small", multiplier: 0.3 },
  ],

  // ✅ Main Meals
  mains: [
    {
      id: nanoid(),
      name: "Rice & Curry",
      prices: {},
      available: true,
    },
  ],

  // ✅ Curries
  curries: [
    {
      id: nanoid(),
      name: "Potato Curry",
      type: "veg",
      available: true,
    },
    {
      id: nanoid(),
      name: "Fish Curry",
      type: "nonveg",
      available: true,
      divisible: true,
      prices: {},
      extraPiecePrice: 40,
    },
  ],
};

export const MerchantConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("merchantConfig");
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem("merchantConfig", JSON.stringify(config));
  }, [config]);

  return (
    <MerchantConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </MerchantConfigContext.Provider>
  );
};

export const useMerchantConfig = () => useContext(MerchantConfigContext);
