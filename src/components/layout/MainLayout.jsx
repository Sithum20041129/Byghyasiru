import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MainLayout = ({ children }) => {
  return (
    <div className="relative w-full h-full">
      <div
        className="fixed inset-0 w-screen h-screen bg-cover bg-center bg-fixed -z-10"
        style={{ backgroundImage: `url('https://horizons-cdn.hostinger.com/e20413e9-d596-4a0b-b570-95741db9c5bd/44787bab6772b277d235a9a48a38dca7.jpg')` }}
      />
      <div className="absolute top-0 left-0 right-0 z-10">
        <header className="p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                    <ChefHat className="w-8 h-8 text-orange-400"/>
                    <span className="text-2xl font-bold">QuickMeal</span>
                </div>
            </div>
        </header>
      </div>
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;