// src/pages/Merchant/MenuPricing.jsx
import React, { useState } from "react";
import { useMerchantConfig } from "@/store/merchantConfig";
import { nanoid } from "nanoid";

const MenuPricing = () => {
  const { config, setConfig } = useMerchantConfig();
  const [newMain, setNewMain] = useState("");
  const [newCurry, setNewCurry] = useState("");
  const [curryType, setCurryType] = useState("veg");
  const [curryDivisible, setCurryDivisible] = useState(false);
  const [newGravy, setNewGravy] = useState("");

  if (!config) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Menu & Pricing</h1>
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  // Helper to read portion list
  const portions = config.portions || config.portionCategories || [];

  // --- Meal Time Selection ---
  const updateMealTime = (value) => {
    setConfig({ ...config, activeMealTime: value });
  };

  // --- Main Meals ---
  const mainListKey = "mainMeals";
  const getMainMeals = () => config[mainListKey] || config.mains || [];

  const addMain = () => {
    if (!newMain.trim()) return;
    const newItem = {
      id: nanoid(),
      name: newMain.trim(),
      available: true,
      prices: portions.reduce((acc, portion) => {
        acc[portion.id] = 0;
        return acc;
      }, {}),
    };
    setConfig({
      ...config,
      [mainListKey]: [...getMainMeals(), newItem],
    });
    setNewMain("");
  };

  const updateMainPrice = (id, portionId, value) => {
    const updated = getMainMeals().map((m) =>
      m.id === id ? { ...m, prices: { ...m.prices, [portionId]: Number(value) } } : m
    );
    setConfig({ ...config, [mainListKey]: updated });
  };

  const updateMainField = (id, field, value) => {
    const updated = getMainMeals().map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    setConfig({ ...config, [mainListKey]: updated });
  };

  const removeMain = (id) => {
    const updated = getMainMeals().filter((m) => m.id !== id);
    setConfig({ ...config, [mainListKey]: updated });
  };

  // --- Curries ---
  const curriesList = config.curries || [];

  const addCurry = () => {
    if (!newCurry.trim()) return;

    let newItem = {
      id: nanoid(),
      name: newCurry.trim(),
      type: curryType,
      divisible: curryType === "nonveg" ? Boolean(curryDivisible) : false,
      available: true,
    };

    if (curryType === "nonveg") {
      // Non-veg curries need portion prices
      newItem.prices = portions.reduce((acc, portion) => {
        acc[portion.id] = 0;
        return acc;
      }, {});

      if (curryDivisible) {
        newItem.extraPiecePrice = 0; // single number
      }
    }

    setConfig({ ...config, curries: [...curriesList, newItem] });
    setNewCurry("");
    setCurryType("veg");
    setCurryDivisible(false);
  };

  const updateCurryField = (id, field, value) => {
    const updated = curriesList.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setConfig({ ...config, curries: updated });
  };

  const updateCurryPrice = (id, portionId, value) => {
    const updated = curriesList.map((c) =>
      c.id === id ? { ...c, prices: { ...c.prices, [portionId]: Number(value) } } : c
    );
    setConfig({ ...config, curries: updated });
  };

  const updateExtraPiecePrice = (id, value) => {
    const updated = curriesList.map((c) =>
      c.id === id ? { ...c, extraPiecePrice: Number(value) } : c
    );
    setConfig({ ...config, curries: updated });
  };

  const removeCurry = (id) => {
    const updated = curriesList.filter((c) => c.id !== id);
    setConfig({ ...config, curries: updated });
  };

  // --- Gravies ---
  const addGravy = () => {
    if (!newGravy.trim()) return;
    const newItem = {
      id: nanoid(),
      name: newGravy.trim(),
      available: true,
    };
    setConfig({ ...config, gravies: [...(config.gravies || []), newItem] });
    setNewGravy("");
  };

  const updateGravyField = (id, field, value) => {
    const updated = (config.gravies || []).map((g) =>
      g.id === id ? { ...g, [field]: value } : g
    );
    setConfig({ ...config, gravies: updated });
  };

  const removeGravy = (id) => {
    const updated = (config.gravies || []).filter((g) => g.id !== id);
    setConfig({ ...config, gravies: updated });
  };

  // --- UI ---
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Menu & Pricing</h1>

      {/* Meal Time Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Meal Time</label>
        <select
          value={config.activeMealTime || (config.mealTimes?.[0] ?? "")}
          onChange={(e) => updateMealTime(e.target.value)}
          className="border rounded p-2 w-full"
        >
          {(config.mealTimes || []).map((meal) => (
            <option key={meal} value={meal}>
              {meal}
            </option>
          ))}
        </select>
      </div>

      {/* Show active meal time */}
      <div className="mt-4">
        <p className="text-lg">
          Currently editing menu for:{" "}
          <span className="font-semibold text-orange-600">
            {config.activeMealTime || "—"}
          </span>
        </p>
      </div>

      {/* Main Meals */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="text-xl font-semibold">Add New Main Item</h2>
        <input
          type="text"
          placeholder="Meal name (e.g., Rice)"
          value={newMain}
          onChange={(e) => setNewMain(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <button
          onClick={addMain}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Add Item
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Main Items & Portion Prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getMainMeals().map((item) => (
            <div key={item.id} className="border rounded p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{item.name}</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) =>
                      updateMainField(item.id, "available", e.target.checked)
                    }
                  />
                  <span>Available</span>
                </label>
              </div>

              <div className="space-y-2">
                {portions.map((portion) => (
                  <div key={portion.id}>
                    <label className="block text-sm">{portion.name} Price:</label>
                    <input
                      type="number"
                      value={item.prices?.[portion.id] ?? ""}
                      onChange={(e) =>
                        updateMainPrice(item.id, portion.id, e.target.value)
                      }
                      className="border rounded p-2 w-full"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => removeMain(item.id)}
                className="text-red-600 text-sm self-end"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Curries Section */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="text-xl font-semibold">Add New Curry</h2>
        <input
          type="text"
          placeholder="Curry name (e.g., Chicken)"
          value={newCurry}
          onChange={(e) => setNewCurry(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <select
          value={curryType}
          onChange={(e) => setCurryType(e.target.value)}
          className="border rounded p-2 w-full mt-2"
        >
          <option value="veg">Veg</option>
          <option value="nonveg">Non-Veg</option>
        </select>

        {curryType === "nonveg" && (
          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={curryDivisible}
              onChange={(e) => setCurryDivisible(e.target.checked)}
            />
            <span>Divisible</span>
          </label>
        )}

        <button
          onClick={addCurry}
          className="bg-green-600 text-white px-4 py-2 rounded mt-2"
        >
          Add Curry
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Curries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curriesList.map((item) => (
            <div key={item.id} className="border rounded p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">
                  {item.name}{" "}
                  <span className="text-sm text-gray-500">
                    ({item.type === "veg" ? "Veg" : "Non-Veg"}{" "}
                    {item.type === "nonveg" &&
                      (item.divisible ? "Divisible" : "Non-Divisible")}
                    )
                  </span>
                </h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) =>
                      updateCurryField(item.id, "available", e.target.checked)
                    }
                  />
                  <span>Available</span>
                </label>
              </div>

              {/* Show nothing for Veg curries (they use store settings price) */}
              {item.type === "nonveg" && (
                <div className="space-y-2">
                  {portions.map((portion) => (
                    <div key={portion.id}>
                      <label className="block text-sm">
                        {portion.name} Base Price:
                      </label>
                      <input
                        type="number"
                        value={item.prices?.[portion.id] ?? ""}
                        onChange={(e) =>
                          updateCurryPrice(item.id, portion.id, e.target.value)
                        }
                        className="border rounded p-2 w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Extra piece price ONLY if non-veg + divisible */}
              {item.type === "nonveg" && item.divisible && (
                <div>
                  <label className="block text-sm">Extra Piece Price:</label>
                  <input
                    type="number"
                    value={item.extraPiecePrice ?? ""}
                    onChange={(e) =>
                      updateExtraPiecePrice(item.id, e.target.value)
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
              )}

              <button
                onClick={() => removeCurry(item.id)}
                className="text-red-600 text-sm self-end"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gravies */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="text-xl font-semibold">Add New Gravy</h2>
        <input
          type="text"
          placeholder="Gravy name (e.g., Parippu)"
          value={newGravy}
          onChange={(e) => setNewGravy(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <button
          onClick={addGravy}
          className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
        >
          Add Gravy
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Gravy Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config.gravies || []).map((item) => (
            <div key={item.id} className="border rounded p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{item.name}</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) =>
                      updateGravyField(item.id, "available", e.target.checked)
                    }
                  />
                  <span>Available</span>
                </label>
              </div>

              <button
                onClick={() => removeGravy(item.id)}
                className="text-red-600 text-sm self-end"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuPricing;
