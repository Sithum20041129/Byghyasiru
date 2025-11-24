import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

const ExtrasSelection = ({ extraOptions, meal, updateMeal }) => {
  const handleExtraChange = (extraType, change) => {
    const currentQuantity = meal.extras[extraType] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    updateMeal({ extras: { ...meal.extras, [extraType]: newQuantity } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="meal-card">
        <CardHeader>
          <CardTitle>3. Add Extras (Optional)</CardTitle>
          <CardDescription>Customize your meal with additional items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extraOptions.map(extra => (
            <div key={extra.value} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">{extra.label}</h4>
                <p className="text-sm text-gray-600">${extra.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtraChange(extra.value, -1)}
                  disabled={!meal.extras[extra.value]}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {meal.extras[extra.value] || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtraChange(extra.value, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExtrasSelection;