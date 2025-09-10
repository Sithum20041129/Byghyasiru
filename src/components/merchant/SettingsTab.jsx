import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';

const SettingsTab = ({ settings, setStoreSettings, onSave }) => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    const storedUniversities = JSON.parse(localStorage.getItem('quickmeal_universities') || '[]');
    setUniversities(storedUniversities.map(uni => ({ value: uni.name, label: uni.name })));
  }, []);

  const handleSettingChange = (field, value) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleUniversityChange = (selected) => {
    setStoreSettings(prev => ({ ...prev, universities: selected }));
  };

  return (
    <Card className="store-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Store Settings
        </CardTitle>
        <CardDescription>
          Manage your store availability, order limits, and university affiliations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
              <div>
                <h4 className="font-semibold">Store Open</h4>
                <p className="text-sm text-gray-600">Accept new customers</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.isOpen}
                  onChange={(e) => handleSettingChange('isOpen', e.target.checked)}
                  className="mr-2"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
              <div>
                <h4 className="font-semibold">Accepting Orders</h4>
                <p className="text-sm text-gray-600">Allow online pre-orders</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.acceptingOrders}
                  onChange={(e) => handleSettingChange('acceptingOrders', e.target.checked)}
                  className="mr-2"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderLimit">Daily Order Limit</Label>
              <Input
                id="orderLimit"
                type="number"
                placeholder="Leave empty for no limit"
                value={settings.orderLimit || ''}
                onChange={(e) => handleSettingChange('orderLimit', e.target.value ? parseInt(e.target.value) : null)}
              />
              <p className="text-sm text-gray-600">
                Limit the number of online orders per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                type="time"
                value={settings.closingTime || ''}
                onChange={(e) => handleSettingChange('closingTime', e.target.value)}
              />
              <p className="text-sm text-gray-600">
                Display closing time to customers
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="universities">Associated Universities</Label>
          <MultiSelect
            options={universities}
            selected={settings.universities || []}
            onChange={handleUniversityChange}
            className="w-full"
            placeholder="Select universities..."
          />
          <p className="text-sm text-gray-600">
            Select universities your store is affiliated with.
          </p>
        </div>

        <Button onClick={onSave} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;