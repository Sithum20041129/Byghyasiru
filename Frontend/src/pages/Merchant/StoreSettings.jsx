// src/pages/Merchant/StoreSettings.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Clock, Plus, X } from "lucide-react";

export default function StoreSettings() {
  const [dailyLimit, setDailyLimit] = useState(50);
  const [closingTime, setClosingTime] = useState("22:00");
  const [breakfastCutoff, setBreakfastCutoff] = useState("");
  const [lunchCutoff, setLunchCutoff] = useState("");
  const [dinnerCutoff, setDinnerCutoff] = useState("");
  const [newPortion, setNewPortion] = useState("");
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Status Feedback
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [activeMeal, setActiveMeal] = useState("Lunch");
  const [serverTime, setServerTime] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/merchant/get_settings.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        if (data.debug) console.log("Store Settings Debug:", data.debug);
        setDailyLimit(data.order_limit || 50);
        setClosingTime(data.closing_time || "22:00");
        setBreakfastCutoff(data.breakfast_cutoff || "");
        setLunchCutoff(data.lunch_cutoff || "");
        setDinnerCutoff(data.dinner_cutoff || "");
        setPortions(data.portions || []);

        // New status logic
        setIsAutoPaused(data.auto_disabled || false);
        setActiveMeal(data.active_meal_time || "Lunch");
        setServerTime(data.server_time || "");
      }
    } catch (err) {
      toast.error("Failed to load settings");
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          order_limit: parseInt(dailyLimit) || null,
          closing_time: closingTime,
          breakfast_cutoff: breakfastCutoff,
          lunch_cutoff: lunchCutoff,
          dinner_cutoff: dinnerCutoff,
          portions: portions
        })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Settings saved!");
        // Reload to recalculate auto-pause status with new times
        loadSettings();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const addPortion = () => {
    const trimmed = newPortion.trim();
    if (!trimmed) return;
    if (portions.includes(trimmed)) {
      toast.error("Portion already exists");
      return;
    }
    setPortions([...portions, trimmed]);
    setNewPortion("");
  };

  const removePortion = (p) => {
    setPortions(portions.filter(x => x !== p));
  };

  return (
    <div className="p-6 space-y-8 bg-white rounded-2xl shadow-lg">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-4m-6 0H5a2 2 0 002-2v-1" />
            </svg>
            Store Settings
          </h1>
          <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
            {loading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">Manage your store availability, order limits, and university affiliations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <Label>Max Pre-Orders Per Meal</Label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              min="1"
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">Maximum allowed orders for each meal period (resets automatically)</p>
          </div>

          {isAutoPaused && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Orders Auto-Paused</p>
                <p className="text-xs mt-1">
                  The cutoff time for <strong>{activeMeal}</strong> has passed based on server time ({serverTime}).
                  New orders are disabled until the next meal period or if you extend the cutoff time.
                </p>
              </div>
            </div>
          )}

          <div>
            <Label>Closing Time</Label>
            <div className="relative mt-1">
              <Input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="pl-10"
              />
              <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-1">Display closing time to customers</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Meal Order Cut-off Times</h3>
            <p className="text-sm text-gray-500 mb-4">Orders will automatically stop at these times for each meal period.</p>

            <div className="space-y-4">
              <div>
                <Label>Breakfast Cut-off</Label>
                <div className="relative mt-1">
                  <Input
                    type="time"
                    value={breakfastCutoff}
                    onChange={(e) => setBreakfastCutoff(e.target.value)}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label>Lunch Cut-off</Label>
                <div className="relative mt-1">
                  <Input
                    type="time"
                    value={lunchCutoff}
                    onChange={(e) => setLunchCutoff(e.target.value)}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <Label>Dinner Cut-off</Label>
                <div className="relative mt-1">
                  <Input
                    type="time"
                    value={dinnerCutoff}
                    onChange={(e) => setDinnerCutoff(e.target.value)}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Add Portion Categories</Label>
          <div className="flex gap-2">
            <Input
              value={newPortion}
              onChange={(e) => setNewPortion(e.target.value)}
              placeholder="e.g., Small, Large"
              onKeyPress={(e) => e.key === 'Enter' && addPortion()}
            />
            <Button onClick={addPortion} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {portions.length === 0 ? (
              <p className="text-sm text-gray-500">No portions added</p>
            ) : (
              portions.map((p) => (
                <div key={p} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {p}
                  <button onClick={() => removePortion(p)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={saveSettings}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}