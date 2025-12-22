// src/pages/Merchant/StoreSettings.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Clock, Plus, X, Store, Timer, Layers,
  Save, RotateCcw, AlertTriangle, Info
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";

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
        setDailyLimit(data.order_limit || 50);
        setClosingTime(data.closing_time || "22:00");
        setBreakfastCutoff(data.breakfast_cutoff || "");
        setLunchCutoff(data.lunch_cutoff || "");
        setDinnerCutoff(data.dinner_cutoff || "");
        setPortions(data.portions || []);

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
        toast.success("Settings saved successfully!");
        loadSettings(); // Reload to sync server calculations
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
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-10 p-4 md:p-6">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Configure your operational limits and schedule.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadSettings} disabled={loading} className="gap-2">
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button onClick={saveSettings} disabled={loading} className="bg-orange-600 hover:bg-orange-700 gap-2 shadow-md shadow-orange-100">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* --- ALERTS --- */}
      {isAutoPaused && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-base">Orders Auto-Paused</h4>
            <p className="text-sm mt-1 text-amber-800 leading-relaxed">
              The cutoff time for <span className="font-bold">{activeMeal}</span> has passed (Server Time: {serverTime}).
              New incoming orders are currently disabled. Extend the cutoff time below to resume.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. GENERAL OPERATIONS */}
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">General Operations</CardTitle>
                  <CardDescription>Basic store limits and visibility.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Max Pre-Orders Per Meal</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    min="1"
                    className="pl-3 h-11 text-lg"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Resets every meal period
                </p>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Display Closing Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <Input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Shown to customers on app</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. AUTO-CUTOFF TIMERS */}
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Timer className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Auto-Close Timers</CardTitle>
                  <CardDescription>Orders automatically stop at these times for each meal.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">Breakfast Ends</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={breakfastCutoff}
                      onChange={(e) => setBreakfastCutoff(e.target.value)}
                      className="pl-8 bg-purple-50/30 border-purple-100 focus:border-purple-300"
                    />
                    <Clock className="absolute left-2.5 top-3 w-4 h-4 text-purple-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">Lunch Ends</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={lunchCutoff}
                      onChange={(e) => setLunchCutoff(e.target.value)}
                      className="pl-8 bg-orange-50/30 border-orange-100 focus:border-orange-300"
                    />
                    <Clock className="absolute left-2.5 top-3 w-4 h-4 text-orange-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-600 text-sm font-medium">Dinner Ends</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={dinnerCutoff}
                      onChange={(e) => setDinnerCutoff(e.target.value)}
                      className="pl-8 bg-indigo-50/30 border-indigo-100 focus:border-indigo-300"
                    />
                    <Clock className="absolute left-2.5 top-3 w-4 h-4 text-indigo-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* 3. PORTION MANAGER */}
          <Card className="border-gray-100 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Portions</CardTitle>
                  <CardDescription>Manage meal sizes.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex gap-2 mb-6">
                <Input
                  value={newPortion}
                  onChange={(e) => setNewPortion(e.target.value)}
                  placeholder="e.g. Small"
                  onKeyPress={(e) => e.key === 'Enter' && addPortion()}
                  className="flex-1"
                />
                <Button onClick={addPortion} size="icon" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase text-gray-400 font-bold tracking-wider">Active Portions</Label>
                <div className="flex flex-wrap gap-2">
                  {portions.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-2">No portions added yet.</p>
                  ) : (
                    portions.map((p) => (
                      <div key={p} className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm shadow-sm group hover:border-red-200 transition-colors">
                        <span className="font-medium">{p}</span>
                        <button
                          onClick={() => removePortion(p)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}