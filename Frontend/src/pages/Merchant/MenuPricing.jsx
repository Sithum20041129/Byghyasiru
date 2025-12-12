// src/pages/Merchant/MenuPricing.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- 1. NEW ATTRACTIVE FOOD CARD COMPONENT ---
const FoodCard = ({ food, onEdit, onDelete, onToggleAvailability, display }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
          {food.name}
        </h3>

        {/* Colorful Badges */}
        {food.food_type === "curry" && food.is_veg == 1 && (
          <Badge className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
            🥦 VEG
          </Badge>
        )}
        {food.food_type === "curry" && food.is_veg == 0 && (
          <Badge className="mt-2 bg-rose-100 text-rose-800 hover:bg-rose-200 border-none">
            🍗 NON-VEG
          </Badge>
        )}
      </div>

      {/* Modern Soft Buttons (Edit/Delete) */}
      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    </div>

    {/* Availability Toggle */}
    <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          id={`availability-${food.id}`}
          checked={food.is_available == 1}
          onCheckedChange={(checked) => onToggleAvailability(food, checked)}
          className="data-[state=checked]:bg-green-600"
        />
        <Label
          htmlFor={`availability-${food.id}`}
          className={`cursor-pointer font-medium ${food.is_available == 1 ? "text-green-700" : "text-gray-400"}`}
        >
          {food.is_available == 1 ? "In Stock" : "Sold Out"}
        </Label>
      </div>
    </div>

    <div className="pt-4 border-t border-dashed border-gray-200">
      {display}
    </div>
  </div>
);

// --- 2. EXISTING FORM COMPONENT (No Changes Needed Here) ---
const FoodForm = ({ food, portions, onSave, onClose }) => {
  const isEdit = !!food?.id;
  const isMainMeal = food?.food_type === "main_meal";
  const isGravy = food?.food_type === "gravy";
  const isCurry = food?.food_type === "curry" || (!isEdit && !isMainMeal && !isGravy);

  // Form state
  const [name, setName] = useState(food?.name || "");

  // For curry: determine initial veg/non-veg
  const initialIsVeg = isEdit
    ? (food?.is_veg == 1 ? "veg" : "nonveg")
    : "veg";
  const [isVeg, setIsVeg] = useState(initialIsVeg);

  // For non-veg: is_divisible (can sell extra pieces)
  const initialDivisible = isEdit && food?.is_veg == 0 ? food?.is_divisible == 1 : false;
  const [isDivisible, setIsDivisible] = useState(initialDivisible);

  const parsedPrices = typeof food?.prices === 'string'
    ? JSON.parse(food.prices)
    : (food?.prices || {});

  const [prices, setPrices] = useState(() => {
    const initialPrices = {};
    portions.forEach(p => {
      initialPrices[p.name] = parsedPrices[p.name] || "";
    });
    return initialPrices;
  });

  const [extraPiecePrice, setExtraPiecePrice] = useState(food?.extra_piece_price || "");

  const handlePriceChange = (portion, value) => {
    setPrices(p => ({ ...p, [portion]: value }));
  };

  const handleSave = () => {
    const baseData = {
      name: name.trim(),
      food_type: food?.food_type || "curry",
    };

    if (isMainMeal) {
      onSave({
        ...baseData,
        prices,
      });
    } else if (isCurry) {
      onSave({
        ...baseData,
        is_veg: isVeg === "veg" ? 1 : 0,
        is_divisible: isVeg === "nonveg" && isDivisible ? 1 : 0,
        prices: isVeg === "nonveg" ? prices : {},
        extra_piece_price: isVeg === "nonveg" && isDivisible ? extraPiecePrice : "",
      });
    } else if (isGravy) {
      onSave(baseData);
    }
  };

  // Only allow "Can sell extra pieces" for non-veg curries
  const showPortionPrices = isCurry && isVeg === "nonveg";
  const showExtraPieceOption = showPortionPrices;

  return (
    <div className="space-y-6">
      <div>
        <Label>Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" autoFocus />
      </div>

      {/* Curry Type Selection - Only when adding new curry */}
      {isCurry && !isEdit && (
        <div>
          <Label>Curry Type *</Label>
          <RadioGroup value={isVeg} onValueChange={setIsVeg}>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label htmlFor="veg" className="cursor-pointer font-medium">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nonveg" id="nonveg" />
                <Label htmlFor="nonveg" className="cursor-pointer font-medium">Non-Vegetarian</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Show badge when editing curry */}
      {isCurry && isEdit && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <Badge variant={food.is_veg == 1 ? "success" : "destructive"} className="text-lg">
            {food.is_veg == 1 ? "Vegetarian" : "Non-Vegetarian"}
          </Badge>
        </div>
      )}

      {/* Portion Prices - Only for Non-Veg Curries & Main Meals */}
      {(showPortionPrices || isMainMeal) && (
        <div className="space-y-4 pt-4 border-t">
          <Label className="text-lg font-medium">Portion Prices (₹)</Label>
          {portions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No portions configured in Store Settings.</p>
          ) : (
            portions.map(portion => (
              <div key={portion.id} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{portion.name}:</span>
                <Input
                  type="number"
                  value={prices[portion.name] || ""}
                  onChange={e => handlePriceChange(portion.name, e.target.value)}
                  placeholder="0"
                  className="w-32"
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Can Sell Extra Pieces - Only for Non-Veg Curries */}
      {showExtraPieceOption && (
        <div className="flex items-center space-x-3 pt-4">
          <Checkbox
            id="divisible"
            checked={isDivisible}
            onChange={(checked) => setIsDivisible(checked)}
          />
          <Label htmlFor="divisible" className="cursor-pointer font-normal">
            Can sell extra pieces
          </Label>
        </div>
      )}

      {/* Extra Piece Price Field */}
      {showExtraPieceOption && isDivisible && (
        <div className="ml-8 -mt-2">
          <Label>Extra Piece Price (RS)</Label>
          <Input
            type="number"
            value={extraPiecePrice}
            onChange={e => setExtraPiecePrice(e.target.value)}
            placeholder="e.g. 50"
            className="w-32"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {isEdit ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
const MenuPricing = () => {
  const [foods, setFoods] = useState([]);
  const [portions, setPortions] = useState([]);
  const [vegCurryPrice, setVegCurryPrice] = useState("");
  const [freeVegCurriesCount, setFreeVegCurriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);

  // Load Data
  const loadMenu = async () => {
    setLoading(true);
    try {
      const [menuRes, portionsRes, settingsRes] = await Promise.all([
        fetch("/api/merchant/get_menu.php", { credentials: "include" }),
        fetch("/api/merchant/get_portions.php", { credentials: "include" }),
        fetch("/api/merchant/get_settings.php", { credentials: "include" })
      ]);

      const menuData = await menuRes.json();
      const portionsData = await portionsRes.json();
      const settingsData = await settingsRes.json();

      if (menuData.ok) setFoods(menuData.foods || []);
      if (portionsData.ok) setPortions(portionsData.portions || []);
      if (settingsData.ok) {
        setVegCurryPrice(settingsData.veg_curry_price || "");
        setFreeVegCurriesCount(settingsData.free_veg_curries_count || 0);
      }
    } catch (err) {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenu(); }, []);

  const handleSave = async (formData, isEdit) => {
    const payload = {
      ...formData,
      meal_time: 'all', // Universal meal time
    };

    if (!isEdit) {
      payload.food_type = editingFood?.food_type || "curry";
    } else {
      payload.id = editingFood.id;
    }

    const endpoint = isEdit ? "/api/merchant/update_food.php" : "/api/merchant/add_food.php";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(isEdit ? "Updated!" : "Added!");
        setIsModalOpen(false);
        setEditingFood(null);
        loadMenu();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch("/api/merchant/delete_food.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deletingFood.id })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Deleted!");
        loadMenu();
      } else toast.error(data.error || "Delete failed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed: " + err.message);
    }
    finally { setDeletingFood(null); }
  };

  // --- DATA SEPARATION LOGIC ---
  const sections = {
    main_meal: foods.filter(f => f.food_type === "main_meal"),
    curry: foods.filter(f => f.food_type === "curry"),
    gravy: foods.filter(f => f.food_type === "gravy")
  };

  // Create separated lists for Veg and Non-Veg
  const vegCurries = sections.curry.filter(c => c.is_veg == 1);
  const nonVegCurries = sections.curry.filter(c => c.is_veg == 0);

  const saveCurrySettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/merchant/settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          veg_curry_price: vegCurryPrice,
          free_veg_curries_count: freeVegCurriesCount
        })
      });
      const data = await res.json();
      if (data.ok) toast.success("Settings saved!");
      else toast.error(data.error || "Save failed");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleAvailability = async (food, isAvailable) => {
    setFoods(prev => prev.map(f =>
      f.id === food.id ? { ...f, is_available: isAvailable ? 1 : 0 } : f
    ));
    try {
      const res = await fetch("/api/merchant/update_food_availability.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: food.id, is_available: isAvailable })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
    } catch (err) {
      setFoods(prev => prev.map(f =>
        f.id === food.id ? { ...f, is_available: !isAvailable ? 1 : 0 } : f
      ));
      toast.error("Failed to update availability");
    }
  };

  const renderPriceDisplay = (food) => {
    if (food.food_type === "gravy") {
      return <Badge variant="outline" className="text-lg font-medium">FREE</Badge>;
    }
    if (food.food_type === "curry" && food.is_veg == 1) {
      return <Badge variant="secondary" className="text-lg">₹{vegCurryPrice} (All Veg Curries)</Badge>;
    }
    if (food.food_type === "curry" && food.is_divisible == 1) {
      return (
        <div className="text-sm space-y-1">
          {portions.map(p => food.prices?.[p.name] && (
            <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
          ))}
          <div className="text-green-600 font-semibold">Extra Piece: ₹{food.extra_piece_price}</div>
        </div>
      );
    }
    return (
      <div className="text-sm space-y-1">
        {portions.map(p => food.prices?.[p.name] && (
          <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center border-b pb-6 bg-white -mx-6 px-6 sticky top-0 z-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Menu & Pricing</h1>
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-500 animate-pulse">Loading your menu...</p>
      ) : (
        <div className="space-y-12">

          {/* --- MAIN MEALS SECTION --- */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Main Meals</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "main_meal" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                + Add Main Meal
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sections.main_meal.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-500 col-span-full">
                  No main meals yet
                </div>
              ) : (
                sections.main_meal.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={renderPriceDisplay(food)}
                  />
                ))
              )}
            </div>
          </div>

          {/* --- CURRIES SECTION --- */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Curries</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "curry" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md"
              >
                + Add Curry
              </Button>
            </div>

            {/* 1. VEGETARIAN SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="text-xl font-bold mb-6 text-orange-800 flex items-center gap-2">
                🥦 Vegetarian Curries
              </h3>

              {/* Global Veg Settings Box */}
              <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-orange-900">Veg Pricing Settings</h2>
                    <p className="text-sm text-orange-600">Global controls for all veg items</p>
                  </div>
                  <Button
                    onClick={saveCurrySettings}
                    disabled={savingSettings}
                    className="bg-orange-600 hover:bg-orange-700 text-white border-none"
                  >
                    {savingSettings ? "Saving..." : "Save Config"}
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-orange-900">Global Veg Curry Price (RS)</Label>
                    <Input
                      type="number"
                      value={vegCurryPrice}
                      onChange={(e) => setVegCurryPrice(e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="e.g. 80"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-900">Free Veg Curries Count</Label>
                    <Input
                      type="number"
                      value={freeVegCurriesCount}
                      onChange={(e) => setFreeVegCurriesCount(e.target.value)}
                      className="mt-1 bg-white"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>

              {/* Veg Curries Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {vegCurries.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl text-gray-400 italic">
                    No vegetarian curries added yet.
                  </div>
                ) : (
                  vegCurries.map(food => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                      onDelete={() => setDeletingFood(food)}
                      onToggleAvailability={toggleAvailability}
                      display={renderPriceDisplay(food)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 2. NON-VEGETARIAN SECTION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="text-xl font-bold mb-6 text-orange-800 flex items-center gap-2">
                🍗 Non-Vegetarian Curries
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {nonVegCurries.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl text-gray-400 italic">
                    No non-vegetarian curries added yet.
                  </div>
                ) : (
                  nonVegCurries.map(food => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                      onDelete={() => setDeletingFood(food)}
                      onToggleAvailability={toggleAvailability}
                      display={renderPriceDisplay(food)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* --- GRAVIES SECTION --- */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-100 pl-3">Gravies</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "gravy" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md"
              >
                + Add Gravy
              </Button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-orange-700">💧 All Gravies are FREE</p>
              <p className="text-orange-600 mt-2">Included with every meal</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sections.gravy.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-500 col-span-full">No gravies yet</div>
              ) : (
                sections.gravy.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={<Badge variant="outline" className="text-lg">FREE</Badge>}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFood?.id ? "Edit" : "Add"}{" "}
              {editingFood?.food_type === "main_meal" ? "Main Meal" :
                editingFood?.food_type === "curry" ? "Curry" : "Gravy"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingFood?.id ? "update" : "add"} a food item.
            </DialogDescription>
          </DialogHeader>
          <FoodForm
            food={editingFood}
            portions={portions}
            onSave={(data) => handleSave(data, !!editingFood?.id)}
            onClose={() => { setIsModalOpen(false); setEditingFood(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFood} onOpenChange={() => setDeletingFood(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingFood?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuPricing;