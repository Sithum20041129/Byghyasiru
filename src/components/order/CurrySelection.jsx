import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';

const CurrySelection = ({ curryOptions, meal, updateMeal, extraCurryPrice }) => {
  const handleCurryChange = (curryIndex, value) => {
    const newCurries = [...meal.curries];
    newCurries[curryIndex] = value;
    updateMeal({ curries: newCurries });
  };

  const addCurrySlot = () => {
    updateMeal({ curries: [...meal.curries, ''] });
  };

  const removeCurrySlot = (index) => {
    updateMeal({ curries: meal.curries.filter((_, i) => i !== index) });
  };

  const canAddMoreCurries = meal.curries.length < curryOptions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="meal-card">
        <CardHeader>
          <CardTitle>2. Select Curries</CardTitle>
          <CardDescription>Your meal includes 3 curries. Add more for ${extraCurryPrice.toFixed(2)} each.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {meal.curries.map((selectedCurry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-grow">
                <label className="text-sm font-medium">Curry {index + 1}</label>
                <Select onValueChange={(value) => handleCurryChange(index, value)} value={selectedCurry}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select curry ${index + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {curryOptions.map(curry => (
                      <SelectItem key={curry.id} value={curry.name}>
                        {curry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {index >= 3 && (
                <Button variant="ghost" size="icon" className="mt-6" onClick={() => removeCurrySlot(index)}>
                  <X className="h-4 w-4 text-red-500"/>
                </Button>
              )}
            </div>
          ))}
          {canAddMoreCurries && (
            <Button variant="outline" onClick={addCurrySlot}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Curry
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CurrySelection;