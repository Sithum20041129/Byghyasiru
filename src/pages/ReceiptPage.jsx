import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

const ReceiptPage = () => {
  const { id } = useParams(); // order id from URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get.php?order_id=${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order); // API returns { success, order }
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600">Order not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Order Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Order Details</h2>
            <p className="text-gray-600">Order #: {order.order_number}</p>
            <p className="text-gray-600">Placed At: {order.created_at}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Store</h2>
            <p className="text-gray-600">{order.store_name}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Customer</h2>
            <p className="text-gray-600">{order.customer_name}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Items</h2>
            <ul className="list-disc list-inside text-gray-700">
              {order.items &&
                order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.food_name} × {item.quantity} — Rs.{item.price}
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Total</h2>
            <p className="text-xl font-bold">Rs.{order.total}</p>
          </div>

          <div className="flex justify-center">
            <Link to="/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptPage;
