// src/pages/Merchant/StoreSettings.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMerchantConfig } from "@/store/merchantConfig";
import { nanoid } from "nanoid";

// 🔹 Example universities (these should come from admin / backend)
const availableUniversities = [
  { id: "uoc", name: "University of Colombo" },
  { id: "uop", name: "University of Peradeniya" },
  { id: "uom", name: "University of Moratuwa" },
  { id: "usjp", name: "University of Sri Jayewardenepura" },
  { id: "uor", name: "University of Ruhuna" },
];

const StoreSettings = ({ settings, setSettings, onSave }) => {
  const { config, setConfig } = useMerchantConfig();
  const [newPortion, setNewPortion] = useState("");

  // Add new portion
  const addPortion = () => {
    if (!newPortion.trim()) return;
    const newItem = { id: nanoid(), name: newPortion, multiplier: 1 };
    setConfig({ ...config, portions: [...(config.portions || []), newItem] });
    setNewPortion("");
  };

  // Update portion name
  const updatePortion = (id, value) => {
    setConfig({
      ...config,
      portions: config.portions.map((p) =>
        p.id === id ? { ...p, name: value } : p
      ),
    });
  };

  // Remove portion
  const removePortion = (id) => {
    setConfig({
      ...config,
      portions: config.portions.filter((p) => p.id !== id),
      mains: config.mains.map((m) => {
        const newPrices = { ...m.prices };
        delete newPrices[id];
        return { ...m, prices: newPrices };
      }),
      curries: config.curries.map((c) => {
        if (!c.prices) return c;
        const newPrices = { ...c.prices };
        delete newPrices[id];
        return { ...c, prices: newPrices };
      }),
    });
  };

  // Update default veg curry count
  const updateDefaultVegCount = (value) => {
    setConfig({
      ...config,
      defaultVegCount: Number(value) || 0,
    });
  };

  // Update extra veg curry price
  const updateExtraVegPrice = (value) => {
    setConfig({
      ...config,
      extraVegPrice: Number(value) || 0,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Store Settings</h1>

      {/* --- Store Toggles --- */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.isOpen}
            onChange={(e) =>
              setSettings({ ...settings, isOpen: e.target.checked })
            }
          />
          <span>Store Open</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.acceptingOrders}
            onChange={(e) =>
              setSettings({ ...settings, acceptingOrders: e.target.checked })
            }
          />
          <span>Accepting Orders</span>
        </label>

        <div>
          <label className="block text-sm">Daily Order Limit</label>
          <input
            type="number"
            value={settings.orderLimit || ""}
            onChange={(e) =>
              setSettings({ ...settings, orderLimit: Number(e.target.value) })
            }
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm">Closing Time</label>
          <input
            type="time"
            value={settings.closingTime}
            onChange={(e) =>
              setSettings({ ...settings, closingTime: e.target.value })
            }
            className="border rounded p-2 w-full"
          />
        </div>
      </div>

      {/* --- Veg Curries Settings --- */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Veg Curries Pricing</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Default Free Veg Curries</label>
            <input
              type="number"
              value={config.defaultVegCount || 0}
              onChange={(e) => updateDefaultVegCount(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm">Extra Veg Curry Price</label>
            <input
              type="number"
              value={config.extraVegPrice || 0}
              onChange={(e) => updateExtraVegPrice(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* --- Universities --- */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Universities</h2>

        {availableUniversities.length === 0 ? (
          <div className="text-sm text-gray-500">
            No universities found. Ask an admin to add some.
          </div>
        ) : (
          <>
            {/* Dropdown */}
            <div className="flex space-x-2 mb-4">
              <select
                value=""
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected && !config.universities.includes(selected)) {
                    setConfig({
                      ...config,
                      universities: [...(config.universities || []), selected],
                    });
                  }
                }}
                className="border rounded p-2 flex-1"
              >
                <option value="">-- Select University --</option>
                {availableUniversities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected universities */}
            <div className="space-y-2">
              {(config.universities || []).map((uniId) => {
                const uni = availableUniversities.find((u) => u.id === uniId);
                return (
                  <div
                    key={uniId}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <span>{uni ? uni.name : uniId}</span>
                    <Button
                      onClick={() =>
                        setConfig({
                          ...config,
                          universities: config.universities.filter(
                            (id) => id !== uniId
                          ),
                        })
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-3"
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* --- Portion Categories --- */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Portion Categories</h2>

        <div className="space-y-2">
          {(config.portions || []).map((portion) => (
            <div
              key={portion.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <input
                type="text"
                value={portion.name}
                onChange={(e) => updatePortion(portion.id, e.target.value)}
                className="border rounded p-2 flex-1 mr-2"
              />
              <Button
                onClick={() => removePortion(portion.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex mt-4 space-x-2">
          <input
            type="text"
            placeholder="New portion name"
            value={newPortion}
            onChange={(e) => setNewPortion(e.target.value)}
            className="border rounded p-2 flex-1"
          />
          <Button
            onClick={addPortion}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Add
          </Button>
        </div>
      </div>

      <Button
        onClick={onSave}
        className="mt-6 bg-orange-500 hover:bg-orange-600"
      >
        Save Settings
      </Button>
    </div>
  );
};

export default StoreSettings;
