// src/pages/Merchant/MenuPricing.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Leaf, Drumstick, Layers, DollarSign } from "lucide-react";
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

// --- 1. FOOD CARD COMPONENT ---
const FoodCard = ({ food, onEdit, onDelete, onToggleAvailability, display }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group h-full">

    {/* === MOBILE VIEW: Horizontal Row === */}
    <div className="md:hidden flex items-start p-4 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-gray-800 truncate">{food.name}</h3>
          {food.food_type === "curry" && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${food.is_veg == 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {food.is_veg == 1 ? 'VEG' : 'NON'}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-3 leading-snug">
          {display}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={`mob-avail-${food.id}`}
            checked={Number(food.available) === 1}
            onCheckedChange={(checked) => onToggleAvailability(food, checked)}
            className="scale-75 origin-left data-[state=checked]:bg-green-600"
          />
          <Label
            htmlFor={`mob-avail-${food.id}`}
            className={`cursor-pointer text-xs font-semibold ${Number(food.available) === 1 ? "text-green-700" : "text-gray-400"}`}
          >
            {Number(food.available) === 1 ? "In Stock" : "Sold Out"}
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-3 border-l border-gray-100">
        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-lg">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-red-600 bg-red-50/50 hover:bg-red-100 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>

    {/* === DESKTOP VIEW: Standard Card === */}
    <div className="hidden md:flex flex-col h-full p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2">
            {food.name}
          </h3>
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
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg mt-auto">
        <div className="flex items-center space-x-2">
          <Switch
            id={`availability-${food.id}`}
            checked={Number(food.available) === 1}
            onCheckedChange={(checked) => onToggleAvailability(food, checked)}
            className="data-[state=checked]:bg-green-600"
          />
          <Label
            htmlFor={`availability-${food.id}`}
            className={`cursor-pointer font-medium text-xs ${Number(food.available) === 1 ? "text-green-700" : "text-gray-400"}`}
          >
            {Number(food.available) === 1 ? "In Stock" : "Sold Out"}
          </Label>
        </div>
      </div>
      <div className="pt-4 border-t border-dashed border-gray-200">
        {display}
      </div>
    </div>
  </div>
);

// ✅ NEW: ADD CARD COMPONENT
const AddCard = ({ label, onClick, className }) => (
  <button
    onClick={onClick}
    className={`
      group border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-200 rounded-2xl
      flex items-center justify-center
      md:flex-col md:h-full md:min-h-[300px] md:p-6
      flex-row w-full h-16 p-2 gap-3
      ${className}
    `}
  >
    <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors shadow-sm">
      <Plus className="w-5 h-5 md:w-8 md:h-8 text-gray-400 group-hover:text-orange-600" />
    </div>
    <span className="font-bold text-gray-500 group-hover:text-orange-700 text-sm md:text-lg">{label}</span>
  </button>
);

// --- 2. IMPROVED FORM COMPONENT ---
const FoodForm = ({ food, portions, onSave, onClose }) => {
  const isEdit = !!food?.id;
  const isMainMeal = food?.food_type === "main_meal";
  const isGravy = food?.food_type === "gravy";
  const isCurry = food?.food_type === "curry" || (!isEdit && !isMainMeal && !isGravy);

  const [name, setName] = useState(food?.name || "");
  const initialIsVeg = (food?.is_veg !== undefined)
    ? (Number(food.is_veg) === 1 ? "veg" : "nonveg")
    : "veg";
  const [isVeg, setIsVeg] = useState(initialIsVeg);
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
      onSave({ ...baseData, prices });
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

  const showPortionPrices = isCurry && isVeg === "nonveg";
  const showExtraPieceOption = showPortionPrices;

  return (
    <div className="flex flex-col h-full">
      {/* --- Scrollable Content Area --- */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-6 max-h-[60vh] md:max-h-[500px] pr-2">

        {/* Name Input */}
        <div className="space-y-2">
          <Label className="text-gray-700">Item Name</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Chicken Curry"
            className="text-lg py-5 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            autoFocus
          />
        </div>

        {/* Curry Type Selection (Cards) */}
        {isCurry && !isEdit && (
          <div className="space-y-3">
            <Label className="text-gray-700">Category</Label>
            <RadioGroup value={isVeg} onValueChange={setIsVeg} className="grid grid-cols-2 gap-4">
              {/* Veg Option */}
              <div
                onClick={() => setIsVeg("veg")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${isVeg === "veg" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"
                  }`}
              >
                <div className={`p-2 rounded-full ${isVeg === "veg" ? "bg-emerald-200" : "bg-gray-100"}`}>
                  <Leaf className={`w-6 h-6 ${isVeg === "veg" ? "text-emerald-700" : "text-gray-400"}`} />
                </div>
                <span className={`font-bold ${isVeg === "veg" ? "text-emerald-700" : "text-gray-500"}`}>Vegetarian</span>
                <RadioGroupItem value="veg" id="veg" className="hidden" />
              </div>

              {/* Non-Veg Option */}
              <div
                onClick={() => setIsVeg("nonveg")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${isVeg === "nonveg" ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-rose-200"
                  }`}
              >
                <div className={`p-2 rounded-full ${isVeg === "nonveg" ? "bg-rose-200" : "bg-gray-100"}`}>
                  <Drumstick className={`w-6 h-6 ${isVeg === "nonveg" ? "text-rose-700" : "text-gray-400"}`} />
                </div>
                <span className={`font-bold ${isVeg === "nonveg" ? "text-rose-700" : "text-gray-500"}`}>Non-Veg</span>
                <RadioGroupItem value="nonveg" id="nonveg" className="hidden" />
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Edit Mode Badge */}
        {isCurry && isEdit && (
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${food.is_veg == 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {food.is_veg == 1 ? <Leaf className="w-5 h-5" /> : <Drumstick className="w-5 h-5" />}
            <span className="font-bold">{food.is_veg == 1 ? "Vegetarian Item" : "Non-Vegetarian Item"}</span>
          </div>
        )}

        {/* Pricing Section */}
        {(showPortionPrices || isMainMeal) && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-gray-500" />
              <Label className="text-base font-semibold text-gray-800">Portion Prices</Label>
            </div>

            {portions.length === 0 ? (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">No portions configured in Store Settings.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {portions.map(portion => (
                  <div key={portion.id} className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{portion.name}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">RS</span>
                      <Input
                        type="number"
                        value={prices[portion.name] || ""}
                        onChange={e => handlePriceChange(portion.name, e.target.value)}
                        placeholder="0"
                        className="pl-9 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Extra Options */}
        {showExtraPieceOption && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setIsDivisible(!isDivisible)}>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="divisible"
                  checked={isDivisible}
                  onCheckedChange={(c) => setIsDivisible(c)}
                />
                <Label htmlFor="divisible" className="cursor-pointer font-medium text-gray-700">Can sell extra pieces?</Label>
              </div>
            </div>

            {/* Extra Piece Price */}
            {isDivisible && (
              <div className="mt-4 ml-8 animate-in slide-in-from-top-2 fade-in">
                <Label className="text-xs text-gray-500 uppercase font-bold mb-1.5 block">Price per piece</Label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">RS</span>
                  <Input
                    type="number"
                    value={extraPiecePrice}
                    onChange={e => setExtraPiecePrice(e.target.value)}
                    placeholder="50"
                    className="pl-9 bg-blue-50/50 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Sticky Footer Actions --- */}
      <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3 bg-white z-10">
        <Button variant="outline" onClick={onClose} className="h-11 px-6">Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim()} className="h-11 px-8 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-100">
          {isEdit ? "Update Item" : "Add to Menu"}
        </Button>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT (Unchanged Logic, updated Layout) ---
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
    const payload = { ...formData, meal_time: 'all' };

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

  const sections = {
    main_meal: foods.filter(f => f.food_type === "main_meal"),
    curry: foods.filter(f => f.food_type === "curry"),
    gravy: foods.filter(f => f.food_type === "gravy")
  };

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
      f.id === food.id ? { ...f, available: isAvailable ? 1 : 0 } : f
    ));
    try {
      const res = await fetch("/api/merchant/update_food_availability.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: food.id, available: isAvailable })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
    } catch (err) {
      setFoods(prev => prev.map(f =>
        f.id === food.id ? { ...f, available: !isAvailable ? 1 : 0 } : f
      ));
      toast.error("Failed to update availability");
    }
  };

  const renderPriceDisplay = (food) => {
    if (food.food_type === "gravy") {
      return <Badge variant="outline" className="text-lg font-medium">FREE</Badge>;
    }
    if (food.food_type === "curry" && food.is_veg == 1) {
      return <Badge variant="secondary" className="text-sm md:text-lg">₹{vegCurryPrice} (All)</Badge>;
    }
    if (food.food_type === "curry" && food.is_divisible == 1) {
      return (
        <div className="text-xs md:text-sm space-y-1">
          {portions.map(p => food.prices?.[p.name] && (
            <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
          ))}
          <div className="text-green-600 font-semibold">Extra: ₹{food.extra_piece_price}</div>
        </div>
      );
    }
    return (
      <div className="text-xs md:text-sm space-y-1">
        {portions.map(p => food.prices?.[p.name] && (
          <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center border-b pb-4 md:pb-6 bg-white -mx-4 md:-mx-6 px-4 md:px-6 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">Menu & Pricing</h1>
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-500 animate-pulse">Loading your menu...</p>
      ) : (
        <div className="space-y-12">

          {/* --- MAIN MEALS SECTION --- */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-center sticky top-16 md:top-20 z-10 bg-gray-50/95 backdrop-blur py-3 -mx-2 px-2 border-b border-gray-100/50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Main Meals</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "main_meal" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all text-xs md:text-sm"
              >
                + Add
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-fr">
              {sections.main_meal.map(food => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                  onDelete={() => setDeletingFood(food)}
                  onToggleAvailability={toggleAvailability}
                  display={renderPriceDisplay(food)}
                />
              ))}
              <AddCard
                label="Add Main Meal"
                onClick={() => { setEditingFood({ food_type: "main_meal" }); setIsModalOpen(true); }}
              />
            </div>
          </div>

          {/* --- CURRIES SECTION --- */}
          <div className="space-y-8">
            <div className="flex justify-between items-center sticky top-16 md:top-20 z-10 bg-gray-50/95 backdrop-blur py-3 -mx-2 px-2 border-b border-gray-100/50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-orange-500 pl-3">Curries</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "curry" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md text-xs md:text-sm"
              >
                + Add
              </Button>
            </div>

            {/* 1. VEGETARIAN SECTION */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-orange-800 flex items-center gap-2">
                🥦 Vegetarian
              </h3>

              {/* Global Veg Settings */}
              <div className="bg-orange-50/50 p-4 md:p-5 rounded-xl border border-orange-100 mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-orange-900">Veg Pricing</h2>
                    <p className="text-xs md:text-sm text-orange-600">Global controls</p>
                  </div>
                  <Button
                    onClick={saveCurrySettings}
                    disabled={savingSettings}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white border-none"
                  >
                    {savingSettings ? "..." : "Save"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-orange-900 text-xs md:text-sm">Price (RS)</Label>
                    <Input
                      type="number"
                      value={vegCurryPrice}
                      onChange={(e) => setVegCurryPrice(e.target.value)}
                      className="mt-1 bg-white h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-900 text-xs md:text-sm">Free Count</Label>
                    <Input
                      type="number"
                      value={freeVegCurriesCount}
                      onChange={(e) => setFreeVegCurriesCount(e.target.value)}
                      className="mt-1 bg-white h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Veg Curries Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-fr">
                {vegCurries.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={renderPriceDisplay(food)}
                  />
                ))}
                <AddCard
                  label="Add Veg Curry"
                  onClick={() => { setEditingFood({ food_type: "curry", is_veg: 1 }); setIsModalOpen(true); }}
                  className="bg-emerald-50/30 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50"
                />
              </div>
            </div>

            {/* 2. NON-VEGETARIAN SECTION */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-orange-800 flex items-center gap-2">
                🍗 Non-Vegetarian
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-fr">
                {nonVegCurries.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={renderPriceDisplay(food)}
                  />
                ))}
                <AddCard
                  label="Add Non-Veg"
                  onClick={() => { setEditingFood({ food_type: "curry", is_veg: 0 }); setIsModalOpen(true); }}
                  className="bg-rose-50/30 border-rose-200 hover:border-rose-500 hover:bg-rose-50"
                />
              </div>
            </div>
          </div>

          {/* --- GRAVIES SECTION --- */}
          <div className="space-y-6">
            <div className="flex justify-between items-center sticky top-16 md:top-20 z-10 bg-gray-50/95 backdrop-blur py-3 -mx-2 px-2 border-b border-gray-100/50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-l-4 border-orange-100 pl-3">Gravies</h2>
              <Button
                onClick={() => { setEditingFood({ food_type: "gravy" }); setIsModalOpen(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md text-xs md:text-sm"
              >
                + Add
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-fr">
              {sections.gravy.map(food => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                  onDelete={() => setDeletingFood(food)}
                  onToggleAvailability={toggleAvailability}
                  display={<Badge variant="outline" className="text-sm">FREE</Badge>}
                />
              ))}
              <AddCard
                label="Add Gravy"
                onClick={() => { setEditingFood({ food_type: "gravy" }); setIsModalOpen(true); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] max-w-lg p-0 overflow-hidden bg-white rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <DialogTitle>
              {editingFood?.id ? "Edit Item" : "New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingFood?.food_type === "main_meal" ? "Main Meal" : editingFood?.food_type === "curry" ? "Curry Dish" : "Gravy"} Details
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