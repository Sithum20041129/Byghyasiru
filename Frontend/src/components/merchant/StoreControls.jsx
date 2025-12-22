// src/components/merchant/StoreControls.jsx
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, Sun, Moon } from 'lucide-react';

const StoreControls = ({ settings, onToggle, onUpdateMealTime }) => {
    return (
        <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                    {/* 1. Meal Time Selector */}
                    <div className="flex-1">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            Current Service
                        </Label>
                        <Select
                            value={settings.active_meal_time}
                            onValueChange={onUpdateMealTime}
                        >
                            <SelectTrigger className="w-full h-12 text-lg font-medium border-orange-200 focus:ring-orange-500 bg-orange-50/50">
                                <div className="flex items-center gap-2">
                                    {settings.active_meal_time === 'Breakfast' && <Coffee className="w-5 h-5 text-orange-600" />}
                                    {settings.active_meal_time === 'Lunch' && <Sun className="w-5 h-5 text-orange-600" />}
                                    {settings.active_meal_time === 'Dinner' && <Moon className="w-5 h-5 text-orange-600" />}
                                    <SelectValue placeholder="Select Meal Time" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Breakfast">Breakfast</SelectItem>
                                <SelectItem value="Lunch">Lunch</SelectItem>
                                <SelectItem value="Dinner">Dinner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                    {/* 2. Toggle Switches */}
                    <div className="flex flex-row gap-4 flex-1">

                        {/* Store Open/Close */}
                        <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border ${settings.is_open ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${settings.is_open ? 'text-green-800' : 'text-gray-600'}`}>
                                    {settings.is_open ? 'Store Open' : 'Store Closed'}
                                </span>
                                <span className="text-xs text-gray-500">Visible to students</span>
                            </div>
                            <Switch
                                checked={settings.is_open}
                                onCheckedChange={(val) => onToggle('is_open', val)}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>

                        {/* Accepting Orders */}
                        <div className={`flex-1 flex items-center justify-between p-3 rounded-xl border ${settings.accepting_orders ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold ${settings.accepting_orders ? 'text-blue-800' : 'text-gray-600'}`}>
                                    {settings.accepting_orders ? 'Accepting' : 'Paused'}
                                </span>
                                <span className="text-xs text-gray-500">Incoming orders</span>
                            </div>
                            <Switch
                                checked={settings.accepting_orders}
                                onCheckedChange={(val) => onToggle('accepting_orders', val)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StoreControls;