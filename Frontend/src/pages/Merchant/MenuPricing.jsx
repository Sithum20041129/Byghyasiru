import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

// Food Form Component
const FoodForm = ({ food, onSave, portions, loading }) => {
  const [formData, setFormData] = useState(
    food || {
      meal_time: "breakfast",
      food_type: "main_meal",
      name: "",
      description: "",
      is_veg: false,
      is_divisible: false,
      extra_piece_price: "",
      prices: {},
    }
  );

  useEffect(() => {
    if (food) setFormData(food);
  }, [food]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (portionName, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: { ...prev.prices, [portionName]: value },
    }));
  };

  const showPortionPrices = formData.food_type === "main_meal" || (formData.food_type === "curry" && !formData.is_veg);
  const showExtraPiece = formData.food_type === "curry" && !formData.is_veg && formData.is_divisible;

  return (
    <div className="space-y-4">
      <div>
        <Label>Meal Time *</Label>
        <Select value={formData.meal_time} onValueChange={(value) => setFormData((prev) => ({ ...prev, meal_time: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select meal time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category *</Label>
        <Select value={formData.food_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, food_type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main_meal">Main Meals</SelectItem>
            <SelectItem value="curry">Curries</SelectItem>
            <SelectItem value="gravy">Gravies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Chicken Fried Rice" />
        </div>
        <div>
          <Label>Description</Label>
          <Input name="description" value={formData.description} onChange={handleChange} placeholder="Optional" />
        </div>
      </div>

      {formData.food_type === "curry" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_veg"
            checked={formData.is_veg}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_veg: checked }))}
          />
          <Label htmlFor="is_veg">Vegetarian</Label>
        </div>
      )}

      {formData.food_type === "curry" && !formData.is_veg && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_divisible"
            checked={formData.is_divisible}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_divisible: checked }))}
          />
          <Label htmlFor="is_divisible">Divisible (e.g., chicken pieces)</Label>
        </div>
      )}

      {showPortionPrices && (
        <div className="space-y-3">
          <Label>Portion Prices *</Label>
          {portions[formData.food_type].map((portion) => (
            <div key={portion} className="flex items-center gap-2">
              <Label className="w-24">{portion}</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.prices[portion] ?? ""}
                onChange={(e) => handlePriceChange(portion, e.target.value)}
                min="0"
                step="0.01"
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
            name="extra_piece_price"
            value={formData.extra_piece_price}
            onChange={handleChange}
            placeholder="e.g., 150.00"
            min="0"
            step="0.01"
          />
        </div>
      )}

      <DialogFooter>
        <Button onClick={() => onSave(formData)} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
};

const MenuPricing = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portions, setPortions] = useState({ main_meal: [], curry: [], gravy: [] });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFood, setDeletingFood] = useState(null);

  useEffect(() => {
    loadMenu();
    const loadPortions = async () => {
      try {
        const res = await fetch('/api/merchant/get_settings.php', { credentials: 'include' });
        const d = await res.json();
        if (d.ok && d.portions) {
          const p = d.portions;
          setPortions({
            main_meal: p,
            curry: p,
            gravy: p.filter(x => x !== 'Half')
          });
        }
      } catch (err) {
        toast.error('Failed to load portions');
      }
    };
    loadPortions();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/get_menu.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setFoods(data.foods || []);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData, isEdit = false) => {
    try {
      const endpoint = isEdit ? '/api/merchant/update_food.php' : '/api/merchant/add_food.php';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(isEdit ? 'Updated!' : 'Added!');
        setIsEditModalOpen(false);
        loadMenu();
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleEditClick = (food) => {
    setEditingFood(food);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (food) => {
    setDeletingFood(food);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch('/api/merchant/delete_food.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: deletingFood.id })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Deleted!');
        setIsDeleteDialogOpen(false);
        loadMenu();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const groupedFoods = useMemo(() => {
    return foods.reduce((acc, food) => {
      if (!acc[food.meal_time]) acc[food.meal_time] = [];
      acc[food.meal_time].push(food);
      return acc;
    }, {});
  }, [foods]);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Menu & Pricing</h1>

      <Tabs defaultValue="breakfast">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
        </TabsList>

        {['breakfast', 'lunch', 'dinner'].map((mealTime) => (
          <TabsContent key={mealTime} value={mealTime} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold capitalize">{mealTime}</h2>
              <Button onClick={() => { setEditingFood(null); setIsEditModalOpen(true); }}>
                Add Food
              </Button>
            </div>

            <div className="space-y-3">
              {(groupedFoods[mealTime] || []).length > 0 ? (
                groupedFoods[mealTime].map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-lg">{item.name}</p>
                      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                      <p className="text-xs text-gray-500 capitalize">{item.food_type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(item)}>Delete</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No items in {mealTime}</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFood ? 'Edit Food' : 'Add New Food'}</DialogTitle>
          </DialogHeader>
          <FoodForm food={editingFood} onSave={handleSave} portions={portions} loading={loading} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deletingFood?.name}"</strong>.
            </AlertDialogDescription>
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