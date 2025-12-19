import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Store, MapPin, LogOut, User, Home, Settings, Coffee, Sun, Moon, Menu, X
} from 'lucide-react';

const CustomerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (loading) return;

    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    try {
      // fetch merchants (with optional university filter)
      const res = await fetch(`/api/merchant/list.php${user.university_id ? `?university_id=${user.university_id}` : ''}`);
      const data = await res.json();

      if (data.success) {
        let merchants = data.data;

        // 🔥 Extra safeguard: filter by university_id in frontend too
        if (user.university_id) {
          merchants = merchants.filter(m => Number(m.university_id) === Number(user.university_id));
        }

        const storesWithSettings = merchants.map(merchant => ({
          id: merchant.id,
          storeName: merchant.store_name,
          storeAddress: merchant.store_address,
          isOpen: merchant.is_open == 1,
          acceptingOrders: merchant.accepting_orders == 1,
          orderLimit: merchant.order_limit,
          closingTime: merchant.closing_time,
          activeMealTime: merchant.active_meal_time || 'Lunch',
          universityId: merchant.university_id,
          universityName: merchant.university_name,
          rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        }));

        setStores(storesWithSettings);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setStores([]);
    }

    // load local orders
    const allOrders = JSON.parse(localStorage.getItem('quickmeal_orders') || '[]');
    const userOrders = allOrders
      .filter(order => order.customerId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(userOrders);
  }, [user, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/');
  };

  const getStoreStatus = (store) => {
    if (!store.isOpen) return { status: 'Closed', color: 'bg-red-100 text-red-800' };
    if (!store.acceptingOrders) return { status: 'Busy', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Open', color: 'bg-green-100 text-green-800' };
  };

  const MealTimeIcon = ({ time }) => {
    switch (time) {
      case 'Breakfast': return <Coffee className="w-4 h-4 mr-2 text-amber-600" />;
      case 'Lunch': return <Sun className="w-4 h-4 mr-2 text-orange-600" />;
      case 'Dinner': return <Moon className="w-4 h-4 mr-2 text-indigo-600" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter flex flex-col lg:flex-row">
      <Helmet><title>Dashboard - QuickMeal</title></Helmet>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-2">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">QuickMeal</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-xl border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center mb-8 hidden lg:flex">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 ml-3">QuickMeal</h1>
            </div>

            {/* Mobile close button inside sidebar (optional visual cue) */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)}><X className="text-gray-500" /></button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl ${activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Home className="w-5 h-5 mr-3" /> Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('account'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl ${activeTab === 'account'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Settings className="w-5 h-5 mr-3" /> Account
              </button>
            </nav>
          </div>
          <div className="p-6 mt-auto">
            <Button onClick={handleLogout} variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 w-full">
        {activeTab === 'dashboard' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Discover restaurants around your university
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Profile card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 mx-auto bg-white/20 rounded-full p-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-orange-500" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{user?.name}</h3>
                    <p className="text-white/80 text-sm mb-3">{user?.email}</p>
                    {user?.university_name && (
                      <Badge className="bg-white/20 text-white">{user.university_name}</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stores */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Restaurants{' '}
                    {user?.university_name && (
                      <span className="text-lg font-normal text-gray-600 ml-2">
                        at {user.university_name}
                      </span>
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
                      <h3 className="text-xl font-semibold mb-2 text-gray-600">
                        No Restaurants Available
                      </h3>
                      <p className="text-gray-500">
                        If you just registered, admin may need to approve merchants. Or try a different university.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {stores.map((store) => {
                      const storeStatus = getStoreStatus(store);
                      return (
                        <Card
                          key={store.id}
                          className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full"
                        >
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{store.storeName}</h3>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{store.storeAddress}</span>
                              </div>
                            </div>
                            <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl">
                              <MealTimeIcon time={store.activeMealTime} />
                              <span className="text-sm font-medium text-gray-700">
                                Accepting <span className="font-semibold">{store.activeMealTime}</span> orders
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-6 pt-0">
                            {store.isOpen && store.acceptingOrders ? (
                              <Link to={`/order/${store.id}`} className="w-full">
                                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                  Order Now
                                </Button>
                              </Link>
                            ) : (
                              <Button disabled className="w-full">Not Accepting Orders</Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'account' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold">Account Information</h3>
              <p className="text-gray-900 font-medium mt-2">{user?.name}</p>
              <p className="text-gray-700">{user?.email}</p>
              {user?.university_name && (
                <p className="text-gray-700 mt-2">University: {user.university_name}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
