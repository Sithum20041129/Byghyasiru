// ✅ src/components/merchant/MenuTab.jsx
import React from "react";
import MenuPricing from "@/pages/Merchant/MenuPricing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const MenuTab = () => {
  return (
    <Card className="store-card">
      <CardHeader>
        <CardTitle>Menu & Pricing</CardTitle>
        <CardDescription>
          Manage your food items, portions, and pricing details.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* ✅ Renders the new advanced system */}
        <MenuPricing />
      </CardContent>
    </Card>
  );
};

export default MenuTab;
