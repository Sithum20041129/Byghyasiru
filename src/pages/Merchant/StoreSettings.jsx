import React, { useState } from "react";
import { useMerchantConfig } from "@/store/merchantConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StoreSettings() {
  const { menuItems, setMenuItems } = useMerchantConfig();
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [portionSize, setPortionSize] = useState("");

  const handleSaveSettings = () => {
    toast.success("✅ Store settings saved successfully!");
  };

  const handleAddPortion = () => {
    if (!portionSize) {
      toast.error("Please enter a portion size!");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: portionSize,
      price: 0,
    };
    setMenuItems([...menuItems, newItem]);
    setPortionSize("");
    toast.success("✅ Portion added!");
  };

  return (
    <div className="p-6 space-y-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold">Store Settings</h1>

      {/* Store Info Section */}
      <div className="space-y-4 border-b pb-6">
        <div>
          <Label>Store Name</Label>
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Enter store name"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            placeholder="Short store description"
          />
        </div>

        <div>
          <Label>Working Hours</Label>
          <Input
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            placeholder="e.g. 8:00 AM - 8:00 PM"
          />
        </div>

        <Button className="w-full mt-2" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>

      {/* Portion Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Manage Portions</h2>
        <div className="flex gap-2">
          <Input
            value={portionSize}
            onChange={(e) => setPortionSize(e.target.value)}
            placeholder="Add new portion size"
          />
          <Button onClick={handleAddPortion}>Add</Button>
        </div>

        <ul className="list-disc pl-6">
          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">No portions added yet.</p>
          ) : (
            menuItems.map((item) => (
              <li key={item.id}>
                {item.name} - Rs.{item.price}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
