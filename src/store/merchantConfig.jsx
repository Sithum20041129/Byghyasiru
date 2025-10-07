import React, { createContext, useState, useContext } from "react";

// ✅ Create context
const MerchantConfigContext = createContext();

// ✅ Provider component
export function MerchantConfigProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);

  return (
    <MerchantConfigContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </MerchantConfigContext.Provider>
  );
}

// ✅ Custom hook for easier use
export function useMerchantConfig() {
  return useContext(MerchantConfigContext);
}

// ✅ Export context (this fixes your build error)
export { MerchantConfigContext };
