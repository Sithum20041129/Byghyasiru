import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Store, Clock, MapPin, LogOut, ShoppingBag, Star, User, Heart, Settings, Bell, 
  XCircle, Receipt, CheckCheck, Sun, Moon, Coffee, Home, Package, MessageSquare,
  TrendingUp, ChevronRight
} from 'lucide-react';
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

const CustomerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
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
        activeMealTime: settings.activeMealTime || 'Lunch',
        rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
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
    if (!store.isOpen) return { status: 'Closed', color: 'bg-red-100 text-red-800' };
    if (!store.acceptingOrders) return { status: 'Busy', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Open', color: 'bg-green-100 text-green-800' };
  };
  
  const getOrderStatus = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
      preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800', icon: Package },
      ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800', icon: CheckCheck },
      completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCheck },
      canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800', icon: XCircle },
      collected: { label: 'Collected', color: 'bg-green-100 text-green-800', icon: CheckCheck }
    };
    const details = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    const IconComponent = details.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${details.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {details.label}
      </div>
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
      case 'Breakfast': return <Coffee className="w-4 h-4 mr-2 text-amber-600" />;
      case 'Lunch': return <Sun className="w-4 h-4 mr-2 text-orange-600" />;
      case 'Dinner': return <Moon className="w-4 h-4 mr-2 text-indigo-600" />;
      default: return null;
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, active: activeTab === 'dashboard' },
    { id: 'favorites', label: 'Favorites', icon: Heart, active: false },
    { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
    { id: 'orders', label: 'My Orders', icon: Package, active: false },
    { id: 'account', label: 'Account', icon: Settings, active: activeTab === 'account' },
  ];

  const AccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900 font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          {user?.university && (
            <div>
              <label className="text-sm font-medium text-gray-700">University</label>
              <p className="text-gray-900">{user.university}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter">
      <Helmet>
        <title>Dashboard - QuickMeal</title>
        <meta name="description" content="Browse restaurants, place orders, and track your meal preparations." />
      </Helmet>

      <div className="flex">
        {/* Modern Sidebar */}
        <motion.aside 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen fixed left-0 top-0 z-10"
        >
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 ml-3">QuickMeal</h1>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dashboard' || item.id === 'account') {
                      setActiveTab(item.id);
                    } else {
                      handleFeatureClick();
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full border-gray-200 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">Discover delicious meals from your favorite restaurants</p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-1"
                >
                  <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto bg-white/20 rounded-full p-1">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-orange-500" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{user?.name}</h3>
                      <p className="text-white/80 text-sm mb-3">{user?.email}</p>
                      {user?.university && (
                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          {user.university}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6"
                  >
                    <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                          Recent Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {orders.length > 0 ? (
                          <div className="space-y-4">
                            {orders.slice(0, 3).map((order, index) => (
                              <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                              >
                                <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 text-sm">{order.storeName}</h4>
                                    <span className="text-xs font-semibold text-gray-700">${order.total.toFixed(2)}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">#{order.orderNumber}</p>
                                  <div className="flex items-center justify-between">
                                    {getOrderStatus(order.status)}
                                    <div className="flex gap-1">
                                      {order.status === 'pending' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                                              <XCircle className="w-4 h-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. Your order will be permanently canceled.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Back</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="bg-red-500 hover:bg-red-600"
                                              >
                                                Yes, Cancel
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                      <Link to={`/receipt/${order.id}`}>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50">
                                          <Receipt className="w-4 h-4" />
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No recent orders</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Restaurants Section */}
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Available Restaurants
                        {user?.university && (
                          <span className="text-lg font-normal text-gray-600 ml-2">at {user.university}</span>
                        )}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {stores.filter(s => s.isOpen && s.acceptingOrders).length} open now
                      </div>
                    </div>

                    {stores.length === 0 ? (
                      <Card className="bg-white shadow-xl border-0 text-center py-16">
                        <CardContent>
                          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-semibold mb-2 text-gray-600">No Restaurants Available</h3>
                          <p className="text-gray-500">Check back later or update your university in settings.</p>
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
                              whileHover={{ y: -8, scale: 1.02 }}
                              className="group"
                            >
                              <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                                <div className="relative">
                                  <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 relative overflow-hidden">
                                    <img 
                                      src="https://images.unsplash.com/photo-1597236654171-3085a99f453f" 
                                      alt={`Food from ${store.storeName}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                  </div>
                                  
                                  <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${storeStatus.color}`}>
                                      {storeStatus.status}
                                    </span>
                                  </div>
                                  
                                  <div className="absolute bottom-4 left-4 flex items-center bg-black/60 text-white px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{store.rating}</span>
                                  </div>
                                </div>

                                <CardContent className="p-6 space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                      {store.storeName}
                                    </h3>
                                    <div className="flex items-center text-gray-500 text-sm">
                                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                      <span className="truncate">{store.storeAddress}</span>
                                    </div>
                                  </div>

                                  {store.activeMealTime && (
                                    <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl">
                                      <MealTimeIcon time={store.activeMealTime} />
                                      <span className="text-sm font-medium text-gray-700">
                                        Accepting <span className="font-semibold">{store.activeMealTime}</span> orders
                                      </span>
                                    </div>
                                  )}

                                  {store.closingTime && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                      <span>Closes at <span className="font-semibold">{store.closingTime}</span></span>
                                    </div>
                                  )}
                                </CardContent>

                                <CardFooter className="p-6 pt-0">
                                  {store.isOpen && store.acceptingOrders ? (
                                    <Link to={`/order/${store.id}`} className="w-full">
                                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-xl py-6">
                                        <ShoppingBag className="w-5 h-5 mr-2" />
                                        <span className="font-semibold">Order Now</span>
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button disabled className="w-full rounded-xl py-6 bg-gray-100 text-gray-500">
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
                  </motion.div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
              <AccountSettings />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;