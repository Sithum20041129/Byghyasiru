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
  const [newPortion, setNewPortion] = useState("");
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/merchant/get_settings.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setDailyLimit(data.order_limit || 50);
        setClosingTime(data.closing_time || "22:00");
        setPortions(data.portions || []);
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
          portions: portions
        })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Settings saved!");
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-4m-6 0H5a2 2 0 002-2v-1" />
          </svg>
          Store Settings
        </h1>
        <p className="text-sm text-gray-600">Manage your store availability, order limits, and university affiliations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <Label>Daily Order Limit</Label>
            <Input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              min="1"
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">Limit the number of online orders per day</p>
          </div>

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