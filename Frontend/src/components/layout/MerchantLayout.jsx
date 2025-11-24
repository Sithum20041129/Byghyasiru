// src/components/layout/MerchantLayout.jsx
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MerchantLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-2xl p-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex space-x-4 border-b mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="menu">Menu & Pricing</TabsTrigger>
            <TabsTrigger value="store">Store Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">{children}</TabsContent>
          {/* You can mount menu & store pages here too if you want */}
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantLayout;
