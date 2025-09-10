import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Receipt,
  Clock,
  CheckCircle,
  MapPin,
  CheckCheck,
} from "lucide-react";

const ReceiptPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [store, setStore] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadOrder = () => {
    const allOrders = JSON.parse(localStorage.getItem("quickmeal_orders") || "[]");
    const foundOrder = allOrders.find(
      (o) => o.id === orderId && o.customerId === user.id
    );

    if (!foundOrder) {
      toast({
        title: "Order Not Found",
        description: "The requested order could not be found",
        variant: "destructive",
      });
      navigate("/customer");
      return;
    }

    const users = JSON.parse(localStorage.getItem("quickmeal_users") || "[]");
    const merchant = users.find((u) => u.id === foundOrder.storeId);

    const settings = JSON.parse(
      localStorage.getItem("quickmeal_store_settings") || "{}"
    );
    const currentStoreSettings = settings[foundOrder.storeId];

    setOrder(foundOrder);
    setStore(merchant);
    setStoreSettings(currentStoreSettings);
  };

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, user, navigate]);

  const handleMarkAsDone = () => {
    const allOrders = JSON.parse(localStorage.getItem("quickmeal_orders") || "[]");
    const updatedOrders = allOrders.map((o) =>
      o.id === orderId ? { ...o, status: "collected" } : o
    );
    localStorage.setItem("quickmeal_orders", JSON.stringify(updatedOrders));
    loadOrder();
    toast({
      title: "Order Collected!",
      description: "Thank you for confirming. Enjoy your meal!",
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: "Order Received",
        color: "secondary",
        description:
          "Your order has been received and is waiting to be prepared",
        icon: Clock,
      },
      preparing: {
        label: "Preparing",
        color: "default",
        description: "Your meal is being prepared with care",
        icon: Clock,
      },
      ready: {
        label: "Ready for Pickup",
        color: "default",
        description:
          "Your order is ready! Please come to the store to collect it",
        icon: CheckCircle,
      },
      completed: {
        label: "Completed",
        color: "default",
        description: "Your order is ready for pickup!",
        icon: CheckCircle,
      },
      collected: {
        label: "Collected",
        color: "success",
        description: "You have collected your order. Enjoy!",
        icon: CheckCheck,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (!order || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const isMultiMeal = Array.isArray(order.meals);

  const getNameById = (list, id) =>
    list?.find((item) => item.id === id)?.name || id;

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Order Receipt #{order.orderNumber} - QuickMeal</title>
        <meta
          name="description"
          content={`Your order receipt from ${store.storeName}. Track your meal preparation status.`}
        />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/customer"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="order-card shadow-2xl">
            <CardHeader className="text-center border-b">
              <div className="flex justify-center mb-4">
                <Receipt className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">
                Order Receipt
              </CardTitle>
              <CardDescription className="text-lg">
                Order #{order.orderNumber}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {/* Status */}
              <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                <StatusIcon className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                <Badge
                  variant={statusInfo.color}
                  className="text-lg px-4 py-2 mb-3"
                >
                  {statusInfo.label}
                </Badge>
                <p className="text-gray-600">{statusInfo.description}</p>
              </div>

              {/* Store Information */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Restaurant Details
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{store.storeName}</p>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {store.storeAddress}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Order Details
                </h3>
                {isMultiMeal ? (
                  order.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="space-y-2 mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0"
                    >
                      <h4 className="font-bold">Meal #{index + 1}</h4>
                      <div>
                        <strong>Main Meal:</strong>{" "}
                        {getNameById(storeSettings?.mainMeals, meal.mainMeal)}
                      </div>
                      <div>
                        <strong>Portion:</strong>{" "}
                        {getNameById(
                          storeSettings?.portionCategories,
                          meal.portion
                        )}
                      </div>
                      <div>
                        <strong>Veg Curries:</strong>{" "}
                        {meal.vegCurries.length > 0
                          ? meal.vegCurries
                              .map((id) =>
                                getNameById(storeSettings?.curries, id)
                              )
                              .join(", ")
                          : "None"}
                      </div>
                      <div>
                        <strong>Non-Veg Curries:</strong>{" "}
                        {meal.nonVegCurries.length > 0
                          ? meal.nonVegCurries
                              .map((nv) => {
                                const curry = storeSettings?.curries?.find(
                                  (c) => c.id === nv.id
                                );
                                if (!curry) return nv.id;
                                if (curry.divisible) {
                                  return `${curry.name} (${nv.pieces} pcs)`;
                                } else {
                                  return nv.extraPieces && nv.extraPieces > 0
                                    ? `${curry.name} (+${nv.extraPieces} extra)`
                                    : curry.name;
                                }
                              })
                              .join(", ")
                          : "None"}
                      </div>
                      <div>
                        <strong>Gravies:</strong>{" "}
                        {meal.gravies.length > 0
                          ? meal.gravies
                              .map((id) =>
                                getNameById(storeSettings?.gravies, id)
                              )
                              .join(", ")
                          : "None"}
                      </div>
                      <div className="flex justify-end font-semibold pt-2">
                        <span>Subtotal: ${meal.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <div>
                      <strong>Main Meal:</strong>{" "}
                      {getNameById(storeSettings?.mainMeals, order.mainMeal)}
                    </div>
                    <div>
                      <strong>Portion:</strong>{" "}
                      {getNameById(storeSettings?.portionCategories, order.portion)}
                    </div>
                    <div>
                      <strong>Veg Curries:</strong>{" "}
                      {order.vegCurries?.length > 0
                        ? order.vegCurries
                            .map((id) => getNameById(storeSettings?.curries, id))
                            .join(", ")
                        : "None"}
                    </div>
                    <div>
                      <strong>Non-Veg Curries:</strong>{" "}
                      {order.nonVegCurries?.length > 0
                        ? order.nonVegCurries
                            .map((nv) => {
                              const curry = storeSettings?.curries?.find(
                                (c) => c.id === nv.id
                              );
                              if (!curry) return nv.id;
                              if (curry.divisible) {
                                return `${curry.name} (${nv.pieces} pcs)`;
                              } else {
                                return nv.extraPieces && nv.extraPieces > 0
                                  ? `${curry.name} (+${nv.extraPieces} extra)`
                                  : curry.name;
                              }
                            })
                            .join(", ")
                        : "None"}
                    </div>
                    <div>
                      <strong>Gravies:</strong>{" "}
                      {order.gravies?.length > 0
                        ? order.gravies
                            .map((id) => getNameById(storeSettings?.gravies, id))
                            .join(", ")
                        : "None"}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-2xl font-bold text-orange-600">
                    <span>Total Paid:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Payment processed successfully
                  </p>
                </div>
              </div>

              {/* Order Information */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Customer:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Status:</strong> {statusInfo.label}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {order.status === "completed" ? (
                  <Button
                    onClick={handleMarkAsDone}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <CheckCheck className="w-5 h-5 mr-2" /> Mark as Done
                  </Button>
                ) : (
                  <Link to="/customer" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Back to Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Print Receipt
                </Button>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please bring this receipt when collecting your order</li>
                  <li>• Orders are typically ready within 15-20 minutes</li>
                  <li>• Contact the restaurant if you have any questions</li>
                </ul>
              </div>

              {order.status === "ready" && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-green-800 text-lg mb-2">
                    🎉 Your Order is Ready!
                  </h4>
                  <p className="text-green-700">
                    Please visit the restaurant to collect your delicious meal!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiptPage;
