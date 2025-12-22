import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee, Sun, Moon, Store, Ban, CheckCircle2 } from 'lucide-react';

const StoreControls = ({ storeSettings, onToggleSetting }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col xl:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                    <Store className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Store Controls</h2>
                    <p className="text-gray-500 text-sm">Manage availability & active services</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-8 justify-center xl:justify-end items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100 w-full xl:w-auto">

                {/* Active Meal Time Selector */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <Label className="font-bold text-gray-700 block">Meal Service</Label>
                        <span className="text-xs text-gray-500">Current Menu</span>
                    </div>
                    <Select
                        value={storeSettings?.active_meal_time}
                        onValueChange={(val) => onToggleSetting('active_meal_time', val)}
                    >
                        <SelectTrigger className="w-[150px] bg-white border-orange-200 focus:ring-orange-500">
                            <SelectValue placeholder="Select meal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Breakfast">
                                <div className="flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-600" /> Breakfast</div>
                            </SelectItem>
                            <SelectItem value="Lunch">
                                <div className="flex items-center gap-2"><Sun className="w-4 h-4 text-orange-600" /> Lunch</div>
                            </SelectItem>
                            <SelectItem value="Dinner">
                                <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-600" /> Dinner</div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="h-10 w-px bg-gray-300 hidden sm:block"></div>

                {/* Store Open/Closed */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${storeSettings?.is_open ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {storeSettings?.is_open ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor="store-open" className="font-bold text-gray-700 cursor-pointer">Store Status</Label>
                            <Switch
                                id="store-open"
                                checked={storeSettings?.is_open}
                                onCheckedChange={(val) => onToggleSetting('is_open', val)}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>
                        <span className={`text-xs font-semibold ${storeSettings?.is_open ? "text-green-600" : "text-red-500"}`}>
                            {storeSettings?.is_open ? "ONLINE" : "OFFLINE"}
                        </span>
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-300 hidden sm:block"></div>

                {/* Accepting Orders */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor="accepting-orders" className="font-bold text-gray-700 cursor-pointer">Accept Orders</Label>
                            <Switch
                                id="accepting-orders"
                                checked={storeSettings?.accepting_orders}
                                onCheckedChange={(val) => onToggleSetting('accepting_orders', val)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>
                        <span className={`text-xs ${storeSettings?.accepting_orders ? "text-blue-600" : "text-gray-400"}`}>
                            {storeSettings?.accepting_orders ? "Accepting" : "Paused"}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StoreControls;
