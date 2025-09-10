import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Store, Clock, MapPin, LogOut, ShoppingBag, Star, User, Heart, Settings, Bell, XCircle, Receipt, CheckCheck, Sun, Moon, Coffee } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountSettingsTab from '@/components/customer/AccountSettingsTab';

const CustomerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = useCallback(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    const users = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const approvedMerchants = users.filter(u => u.role === 'merchant' && u.approved);
    
    const storeSettingsData = JSON.parse(localStorage.getItem('quickmeal_store_settings') || '{}');
    
    let storesWithSettings = approvedMerchants.map(merchant => {
      const settings = storeSettingsData[merchant.id] || {};
      return {
        ...merchant,
        isOpen: settings.isOpen !== false,
        acceptingOrders: settings.acceptingOrders !== false,
        orderLimit: settings.orderLimit || null,
        closingTime: settings.closingTime || null,
        universities: settings.universities || [],
        activeMealTime: settings.activeMealTime || 'Lunch', // New property
        rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Fake rating
      };
    });

    if (user.university) {
      storesWithSettings = storesWithSettings.filter(store => 
        store.universities.length === 0 || store.universities.includes(user.university)
      );
    }

    setStores(storesWithSettings);

    const allOrders = JSON.parse(localStorage.getItem('quickmeal_orders') || '[]');
    const userOrders = allOrders.filter(order => order.customerId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);
  }, [user, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'See you next time!'
    });
    navigate('/');
  };

  const handleCancelOrder = (orderId) => {
    const allOrders = JSON.parse(localStorage.getItem('quickmeal_orders') || '[]');
    const updatedOrders = allOrders.map(order => 
      order.id === orderId ? { ...order, status: 'canceled' } : order
    );
    localStorage.setItem('quickmeal_orders', JSON.stringify(updatedOrders));
    loadData();
    toast({
      title: 'Order Canceled',
      description: 'Your order has been successfully canceled.',
    });
  };

  const handleMarkAsDone = (orderId) => {
    const allOrders = JSON.parse(localStorage.getItem('quickmeal_orders') || '[]');
    const updatedOrders = allOrders.map(order =>
      order.id === orderId ? { ...order, status: 'collected' } : order
    );
    localStorage.setItem('quickmeal_orders', JSON.stringify(updatedOrders));
    loadData();
    toast({
      title: 'Order Collected!',
      description: 'Thank you for your purchase!',
    });
  };

  const getStoreStatus = (store) => {
    if (!store.isOpen) return { status: 'Closed', color: 'destructive' };
    if (!store.acceptingOrders) return { status: 'Busy', color: 'secondary' };
    return { status: 'Open', color: 'default' };
  };
  
  const getOrderStatus = (status) => {
    const statusMap = {
      pending: { label: 'Not Prepared', color: 'secondary', textColor: 'text-gray-800' },
      preparing: { label: 'Prepared', color: 'default', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
      ready: { label: 'Ready for Pickup', color: 'default', textColor: 'text-green-800', bgColor: 'bg-green-100' },
      completed: { label: 'Completed', color: 'default', textColor: 'text-purple-800', bgColor: 'bg-purple-100' },
      canceled: { label: 'Canceled', color: 'destructive', textColor: 'text-red-800', bgColor: 'bg-red-100' },
      collected: { label: 'Collected', color: 'success', textColor: 'text-green-800', bgColor: 'bg-green-100' }
    };
    const details = statusMap[status] || { label: status, color: 'secondary' };
    
    return (
      <Badge variant={details.color} className={`${details.bgColor} ${details.textColor} border-none`}>
        {details.label}
      </Badge>
    );
  };
  
  const handleFeatureClick = () => {
    toast({
      title: "🚧 Feature in Progress!",
      description: "This cool feature is still cooking. You can request it in your next prompt! 🚀",
    });
  };

  const MealTimeIcon = ({ time }) => {
    switch (time) {
      case 'Breakfast': return <Coffee className="w-4 h-4 mr-2" />;
      case 'Lunch': return <Sun className="w-4 h-4 mr-2" />;
      case 'Dinner': return <Moon className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Customer Dashboard - QuickMeal</title>
        <meta name="description" content="Browse restaurants, place orders, and track your meal preparations." />
        <meta property="og:title" content="Customer Dashboard - QuickMeal" />
        <meta property="og:description" content="Browse restaurants, place orders, and track your meal preparations." />
      </Helmet>

      <div className="max-w-screen-xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Let's get you something delicious.</p>
          </motion.div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <aside className="lg:col-span-1 xl:col-span-1 space-y-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 flex flex-col items-center text-white">
                      <div className="relative p-1 bg-white/30 rounded-full mb-3">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                          <User className="w-12 h-12 text-orange-500" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-sm opacity-80">{user?.email}</p>
                      {user?.university && <Badge variant="secondary" className="mt-2">{user.university}</Badge>}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <Button onClick={handleFeatureClick} variant="ghost" className="w-full justify-start"><Heart className="w-4 h-4 mr-3" /> Favorites</Button>
                      <Button onClick={handleFeatureClick} variant="ghost" className="w-full justify-start"><Bell className="w-4 h-4 mr-3" /> Notifications</Button>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl">Your Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex items-start space-x-3">
                              <div className="p-2 rounded-full bg-orange-100 mt-1">
                                <ShoppingBag className="w-5 h-5 text-orange-600"/>
                              </div>
                              <div className="flex-grow">
                                <p className="font-semibold text-sm">{order.storeName}</p>
                                <p className="text-xs text-gray-500">#{order.orderNumber} - ${order.total.toFixed(2)}</p>
                                <div className="mt-2 flex justify-between items-center">
                                  {getOrderStatus(order.status)}
                                  <div className="flex items-center gap-2">
                                    {order.status === 'pending' && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-auto p-1 text-red-500 hover:bg-red-100 hover:text-red-600">
                                            <XCircle className="w-4 h-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently cancel your order.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancelOrder(order.id)} className="bg-red-500 hover:bg-red-600">
                                              Yes, Cancel Order
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                    {order.status === 'completed' && (
                                      <Button onClick={() => handleMarkAsDone(order.id)} variant="ghost" size="sm" className="h-auto p-1 text-green-500 hover:bg-green-100 hover:text-green-600">
                                        <CheckCheck className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Link to={`/receipt/${order.id}`}>
                                      <Button variant="outline" size="sm" className="h-auto p-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                                        <Receipt className="w-4 h-4" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recent orders.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </aside>

              <main className="lg:col-span-2 xl:col-span-3">
                <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Restaurants {user?.university && `at ${user.university}`}</h2>
                  
                  {stores.length === 0 ? (
                    <Card className="store-card text-center py-12 bg-gray-50">
                      <CardContent>
                        <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-600">No Restaurants Available</h3>
                        <p className="text-gray-500">Check back later or change your university in settings.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {stores.map((store, index) => {
                        const storeStatus = getStoreStatus(store);
                        return (
                          <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                          >
                            <Card className="store-card h-full flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                              <div className="relative">
                                <img  class="h-40 w-full object-cover" alt={`A vibrant display of food from ${store.storeName}`} src="https://images.unsplash.com/photo-1597236654171-3085a99f453f" />
                                <div className="absolute top-2 right-2">
                                  <Badge variant={storeStatus.color} className="shadow-md">
                                    {storeStatus.status}
                                  </Badge>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white p-1 px-2 rounded-full flex items-center text-xs">
                                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" /> {store.rating}
                                </div>
                              </div>
                              <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-800 truncate">
                                  {store.storeName}
                                </CardTitle>
                                <CardDescription className="flex items-center text-gray-500 text-sm">
                                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                  {store.storeAddress}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="flex-grow space-y-3">
                                {store.activeMealTime && (
                                  <div className="flex items-center text-sm text-blue-600 font-semibold bg-blue-50 p-2 rounded-md">
                                    <MealTimeIcon time={store.activeMealTime} />
                                    <span>Accepting Orders for <strong>{store.activeMealTime}</strong></span>
                                  </div>
                                )}
                                {store.closingTime && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Clock className="w-4 h-4 mr-2" />
                                      <span>Closes at <strong>{store.closingTime}</strong></span>
                                    </div>
                                  )}
                              </CardContent>
                              <CardFooter className="p-4 bg-gray-50/50">
                                {store.isOpen && store.acceptingOrders ? (
                                    <Link to={`/order/${store.id}`} className="w-full">
                                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Order Now
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button disabled className="w-full">
                                      {!store.isOpen ? 'Currently Closed' : 'Not Accepting Orders'}
                                    </Button>
                                  )}
                              </CardFooter>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              </main>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <AccountSettingsTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;