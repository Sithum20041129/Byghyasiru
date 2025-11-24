import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const DashboardHeader = ({ storeName, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold gradient-text">{storeName}</h1>
        <p className="text-gray-600 mt-2">Manage your restaurant and orders</p>
      </motion.div>
      
      <Button onClick={onLogout} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default DashboardHeader;