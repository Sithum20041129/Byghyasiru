import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Helper component for the form to add/edit food
const FoodForm = ({ food, onSave, portions, loading }) => {
  const [formData, setFormData] = useState(
    food || {
      name: "",
      description: "",
      is_veg: false,
      is_divisible: false,
      extra_piece_price: "",
      prices: {},
    }
  );

  useEffect(() => {
    setFormData(food);
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

  const showPortionPrices =
    food.food_type === "main_meal" ||
    (food.food_type === "curry" && !formData.is_veg);
  const showExtraPiece =
    food.food_type === "curry" && !formData.is_veg && formData.is_divisible;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <Label>Description</Label>
          <Input name="description" value={formData.description} onChange={handleChange} />
        </div>
      </div>

      {food.food_type === "curry" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_veg"
              checked={formData.is_veg}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_veg: checked }))}
            />
            <Label htmlFor="is_veg">Vegetarian Curry</Label>
          </div>
          {!formData.is_veg && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_divisible"
                checked={formData.is_divisible}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_divisible: checked }))}
              />
              <Label htmlFor="is_divisible">Divisible (Allows extra pieces)</Label>
            </div>
          )}
        </div>
      )}

      {showPortionPrices && portions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Portion Prices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {portions.map((p) => (
              <div key={p.id}>
                <Label>{p.name}</Label>
                <Input
                  type="number"
                  placeholder={`Price for ${p.name}`}
                  value={formData.prices[p.name] || ""}
                  onChange={(e) => handlePriceChange(p.name, e.target.value)}
                />
              </div>
            ))}
          </div>
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
          />
        </div>
      )}

      <Button className="w-full" onClick={() => onSave(formData)} disabled={loading}>
        {loading ? "Saving..." : "Save Food Item"}
      </Button>
    </div>
  );
};


export default function MenuPricing() {
  const [menuItems, setMenuItems] = useState([]);
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("main_meal");

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFood, setDeletingFood] = useState(null);

  const foodTypeMap = {
    main_meal: "Main Meal",
    curry: "Curry",
    gravy: "Gravy",
  };
  
  // Fetch menu and portions on load
  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, portionRes] = await Promise.all([
        fetch("/api/merchant/get_menu.php"),
        fetch("/api/merchant/get_portions.php"),
      ]);

      const menuData = await menuRes.json();
      if (menuData.ok) {
        // Ensure prices are in the format { portionName: price }
        const formattedMenu = menuData.foods.map(food => ({
            ...food,
            prices: food.prices.reduce((acc, p) => {
                acc[p.portion_name] = p.price;
                return acc;
            }, {})
        }));
        setMenuItems(formattedMenu || []);
      } else {
        toast.error("Failed to load menu: " + (menuData.error || "Unknown"));
      }

      const portionData = await portionRes.json();
      if (portionData.ok) {
        setPortions(portionData.portions || []);
      } else {
        toast.error("Failed to load portion categories.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Handlers for opening modals
  const handleEditClick = (foodItem) => {
    setEditingFood(foodItem);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (foodItem) => {
    setDeletingFood(foodItem);
    setIsDeleteDialogOpen(true);
  };

  // API call handlers
  const handleSave = async (foodData, isUpdate = false) => {
    setLoading(true);
    const endpoint = isUpdate ? "/api/merchant/update_food.php" : "/api/merchant/add_food.php";
    
    const payload = {
        ...foodData,
        food_type: foodData.food_type || activeTab,
        prices: Object.entries(foodData.prices).map(([portion, price]) => ({
            portion,
            price: parseFloat(price) || 0,
        })),
        is_veg: foodData.is_veg ? 1 : 0,
        is_divisible: foodData.is_divisible ? 1 : 0,
    };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.ok) throw new Error(result.error || "Operation failed");

        toast.success(`Food item ${isUpdate ? 'updated' : 'added'} successfully!`);
        fetchData(); // Refresh data
        setIsEditModalOpen(false); // Close modal on success
    } catch (err) {
        toast.error(`Failed to ${isUpdate ? 'update' : 'add'} food: ` + err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const confirmDelete = async () => {
    if (!deletingFood) return;
    setLoading(true);
    try {
        const res = await fetch("/api/merchant/delete_food.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deletingFood.id }),
        });
        const result = await res.json();
        if (!res.ok || !result.ok) throw new Error(result.error || "Deletion failed");

        toast.success("Food item deleted successfully!");
        fetchData(); // Refresh data
    } catch(err) {
        toast.error("Failed to delete item: " + err.message);
    } finally {
        setLoading(false);
        setIsDeleteDialogOpen(false);
    }
  };
  
  // Memoize filtered lists to prevent re-filtering on every render
  const filteredMenuItems = useMemo(() => 
    menuItems.filter(item => item.food_type === activeTab),
    [menuItems, activeTab]
  );
  
  return (
    <div className="p-8 bg-white shadow-lg rounded-2xl space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Menu & Pricing</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="main_meal">Main Meals</TabsTrigger>
          <TabsTrigger value="curry">Curries</TabsTrigger>
          <TabsTrigger value="gravy">Gravies</TabsTrigger>
        </TabsList>
        
        {["main_meal", "curry", "gravy"].map(tabName => (
          <TabsContent key={tabName} value={tabName} className="space-y-6">
            <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Add New {foodTypeMap[tabName]}</h2>
                <FoodForm
                    food={{ food_type: tabName, name: "", description: "", is_veg: false, is_divisible: false, extra_piece_price: "", prices: {} }}
                    onSave={(foodData) => handleSave(foodData, false)}
                    portions={portions}
                    loading={loading}
                />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Current {foodTypeMap[tabName]}</h2>
              {loading ? <p>Loading...</p> : 
                (filteredMenuItems.length === 0 ? <p className="text-gray-500">No items in this category yet.</p> :
                  <div className="space-y-3">
                    {filteredMenuItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50">
                          <div>
                              <p className="font-medium text-lg">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(item)}>Delete</Button>
                          </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editing: {editingFood?.name}</DialogTitle>
          </DialogHeader>
          {editingFood && 
            <FoodForm 
                food={editingFood} 
                onSave={(foodData) => handleSave(foodData, true)}
                portions={portions} 
                loading={loading}
            />
          }
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the food item "{deletingFood?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}