import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MealTypeSelection = ({ meal, updateMeal, mealTypes }) => {
  const handleMealTypeChange = (value) => {
    updateMeal({ mealType: value, curries: ['', '', ''] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="meal-card">
        <CardHeader>
          <CardTitle>1. Choose Your Meal Type</CardTitle>
          <CardDescription>Select your preferred meal base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {mealTypes.map(mealTypeOption => (
              <div
                key={mealTypeOption.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  meal.mealType === mealTypeOption.value 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => handleMealTypeChange(mealTypeOption.value)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{mealTypeOption.label}</h4>
                  <span className="text-lg font-bold text-orange-600">${mealTypeOption.basePrice}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MealTypeSelection;