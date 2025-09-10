import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MenuTab = ({ storeSettings, setStoreSettings, onSave }) => {
  const { menuItems, curries, activeMealTime } = storeSettings;

  const handleMenuItemChange = (item, field, value) => {
    setStoreSettings(prev => ({
      ...prev,
      menuItems: {
        ...prev.menuItems,
        [item]: { ...prev.menuItems[item], [field]: value }
      }
    }));
  };

  const handleCurryChange = (id, field, value) => {
    setStoreSettings(prev => ({
      ...prev,
      curries: prev.curries.map(curry =>
        curry.id === id ? { ...curry, [field]: value } : curry
      )
    }));
  };

  const handleMealTimeChange = (value) => {
    setStoreSettings(prev => ({ ...prev, activeMealTime: value }));
  };

  const addCurry = () => {
    setStoreSettings(prev => ({
      ...prev,
      curries: [
        ...prev.curries,
        { id: uuidv4(), name: 'New Curry', available: true, price: 5.00 }
      ]
    }));
  };

  const removeCurry = (id) => {
    setStoreSettings(prev => ({
      ...prev,
      curries: prev.curries.filter(curry => curry.id !== id)
    }));
  };

  // ✅ Save handler that syncs mains with menuItems
  const handleSave = () => {
    const mains = Object.entries(storeSettings.menuItems || {}).map(([key, value]) => ({
      id: key,
      name: key.replace(/([A-Z])/g, " $1").trim(),
      available: value.available,
      prices: { default: value.price }, // extend later for portions
    }));

    const updatedSettings = {
      ...storeSettings,
      mains, // 👈 sync mains so OrderPage sees latest
    };

    setStoreSettings(updatedSettings);

    // persist to localStorage
    const allStoreSettings = JSON.parse(localStorage.getItem("quickmeal_store_settings") || "{}");
    allStoreSettings[storeSettings.storeId] = updatedSettings;
    localStorage.setItem("quickmeal_store_settings", JSON.stringify(allStoreSettings));

    onSave && onSave(updatedSettings);
  };

  return (
    <Card className="store-card">
      <CardHeader>
        <CardTitle>Menu Items & Pricing</CardTitle>
        <CardDescription>
          Set the active menu and update availability and prices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Active Menu</h3>
          <div className="space-y-2">
            <Label htmlFor="activeMealTime">Set which meal this menu is for</Label>
            <Select value={activeMealTime} onValueChange={handleMealTimeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a meal time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Main Items & Extras</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(menuItems).map(([item, details]) => (
              <div key={item} className="border rounded-lg p-4 bg-white/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">
                    {item.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={details.available}
                      onChange={(e) => handleMenuItemChange(item, 'available', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-orange-600"
                    />
                    <span>Available</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`price-${item}`}>Price:</Label>
                  <Input
                    id={`price-${item}`}
                    type="number"
                    step="0.01"
                    value={details.price}
                    onChange={(e) => handleMenuItemChange(item, 'price', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Curries</h3>
            <Button variant="outline" size="sm" onClick={addCurry}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Curry
            </Button>
          </div>
          <div className="space-y-4">
            {curries.map((curry) => (
              <div
                key={curry.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border rounded-lg p-4 bg-white/50"
              >
                <div className="md:col-span-5">
                  <Label htmlFor={`name-${curry.id}`}>Curry Name</Label>
                  <Input
                    id={`name-${curry.id}`}
                    value={curry.name}
                    onChange={(e) => handleCurryChange(curry.id, 'name', e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor={`price-${curry.id}`}>Price</Label>
                  <Input
                    id={`price-${curry.id}`}
                    type="number"
                    step="0.01"
                    value={curry.price}
                    onChange={(e) => handleCurryChange(curry.id, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-3 flex items-end h-full">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={curry.available}
                      onChange={(e) => handleCurryChange(curry.id, 'available', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-orange-600"
                    />
                    <span>Available</span>
                  </label>
                </div>
                <div className="md:col-span-1 flex items-end h-full">
                  <Button variant="ghost" size="sm" onClick={() => removeCurry(curry.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-full"
        >
          Save All Menu Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default MenuTab;
