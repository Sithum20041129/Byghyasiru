// src/pages/Merchant/MenuPricing.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// Reusable Food Form
const FoodForm = ({ food, onSave, portions, onClose }) => {
  const [formData, setFormData] = useState(
    food || {
      meal_time: "lunch",
      food_type: "main_meal",
      name: "",
      description: "",
      is_veg: false,
      is_divisible: false,
      extra_piece_price: "",
      prices: {}, // Always initialized
    }
  );

  useEffect(() => {
    if (food) {
      setFormData({
        ...food,
        prices: food.prices || {}, // Ensure prices always exists
        is_veg: !!food.is_veg,
        is_divisible: !!food.is_divisible,
      });
    }
  }, [food]);

  const handlePriceChange = (portion, value) => {
    setFormData(prev => ({
      ...prev,
      prices: { ...prev.prices, [portion]: value }
    }));
  };

  const showPortionPrices = formData.food_type === "main_meal" || (formData.food_type === "curry" && !formData.is_veg);
  const showExtraPiece = formData.food_type === "curry" && !formData.is_veg && formData.is_divisible;

  const handleSubmit = () => {
    onSave(formData, !!food?.id);
  };

  return (
    <div className="space-y-5 max-h-screen overflow-y-auto pb-10">
      <div>
        <Label>Meal Time *</Label>
        <Select value={formData.meal_time} onValueChange={v => setFormData(p => ({ ...p, meal_time: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category *</Label>
        <Select value={formData.food_type} onValueChange={v => setFormData(p => ({ ...p, food_type: v, prices: {} }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="main_meal">Main Meal</SelectItem>
            <SelectItem value="curry">Curry</SelectItem>
            <SelectItem value="gravy">Gravy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
        </div>
      </div>

      {formData.food_type === "curry" && (
        <div className="flex items-center gap-2">
          <Checkbox checked={formData.is_veg} onCheckedChange={c => setFormData(p => ({ ...p, is_veg: c, is_divisible: c ? false : p.is_divisible }))} />
          <Label>Vegetarian</Label>
        </div>
      )}

      {formData.food_type === "curry" && !formData.is_veg && (
        <div className="flex items-center gap-2">
          <Checkbox checked={formData.is_divisible} onCheckedChange={c => setFormData(p => ({ ...p, is_divisible: c }))} />
          <Label>Divisible (extra pieces)</Label>
        </div>
      )}

      {showPortionPrices && (
        <div className="space-y-3 border-t pt-4">
          <Label>Portion Prices *</Label>
          {portions[formData.food_type].map(p => (
            <div key={p} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{p}</span>
              <Input
                type="number"
                step="0.01"
                value={formData.prices?.[p] ?? ""}
                onChange={e => handlePriceChange(p, e.target.value)}
                placeholder="0.00"
              />
            </div>
          ))}
        </div>
      )}

      {showExtraPiece && (
        <div>
          <Label>Extra Piece Price</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.extra_piece_price || ""}
            onChange={e => setFormData(p => ({ ...p, extra_piece_price: e.target.value }))}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{food?.id ? "Update" : "Add"} Food</Button>
      </div>
    </div>
  );
};

const MenuPricing = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealTime, setSelectedMealTime] = useState("lunch");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);

  const portions = {
    main_meal: ["Full", "Half", "Quarter"],
    curry: ["Full", "Half", "Quarter"],
    gravy: ["Full", "Half"]
  };

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/get_menu.php", { credentials: "include" });
      const data = await res.json();
      if (data.ok) setFoods(data.foods || []);
      else toast.error(data.error || "Failed to load menu");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenu(); }, []);

  const handleSave = async (formData, isEdit) => {
    const endpoint = isEdit ? "/api/merchant/update_food.php" : "/api/merchant/add_food.php";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(isEdit ? "Updated!" : "Added!");
        setIsModalOpen(false);
        setEditingFood(null);
        loadMenu();
      } else toast.error(data.error || "Save failed");
    } catch (err) {
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
      } else toast.error(data.error);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingFood(null);
    }
  };

  const filteredFoods = foods.filter(f => f.meal_time === selectedMealTime);

  const sections = {
    main_meal: filteredFoods.filter(f => f.food_type === "main_meal"),
    curry: filteredFoods.filter(f => f.food_type === "curry"),
    gravy: filteredFoods.filter(f => f.food_type === "gravy")
  };

  const sectionTitles = {
    main_meal: "Main Meals",
    curry: "Curries",
    gravy: "Gravies"
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu & Pricing</h1>
        <div className="flex items-center gap-4">
          <Label className="text-lg">This menu is for:</Label>
          <Select value={selectedMealTime} onValueChange={setSelectedMealTime}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading menu...</p>
      ) : (
        <div className="space-y-10">
          {["main_meal", "curry", "gravy"].map(type => (
            <section key={type} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{sectionTitles[type]}</h2>
                <Button onClick={() => {
                  setEditingFood({
                    meal_time: selectedMealTime,
                    food_type: type,
                    name: "",
                    description: "",
                    is_veg: false,
                    is_divisible: false,
                    extra_piece_price: "",
                    prices: {} // Critical: always initialize prices
                  });
                  setIsModalOpen(true);
                }}>
                  Add {type === "main_meal" ? "Main Meal" : type === "curry" ? "Curry" : "Gravy"}
                </Button>
              </div>

              {sections[type].length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No {sectionTitles[type].toLowerCase()} added yet
                </p>
              ) : (
                <div className="grid gap-4">
                  {sections[type].map(food => (
                    <div key={food.id} className="flex justify-between items-center p-5 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-semibold text-lg">{food.name}</p>
                        {food.description && <p className="text-sm text-gray-600">{food.description}</p>}
                        {food.is_veg == 1 && <span className="text-xs text-green-600 font-medium"> Vegetarian</span>}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={() => { setEditingFood(food); setIsModalOpen(true); }}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeletingFood(food)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFood?.id ? "Edit" : "Add"} Food Item</DialogTitle>
          </DialogHeader>
          <FoodForm
            food={editingFood}
            onSave={handleSave}
            portions={portions}
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