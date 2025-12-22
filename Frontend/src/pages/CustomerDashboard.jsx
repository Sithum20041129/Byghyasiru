// src/pages/CustomerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Store, MapPin, LogOut, User, Home, ShoppingBag,
  Coffee, Sun, Moon, Receipt, ChevronRight, Search
} from 'lucide-react';

// --- COMPONENTS ---

const MobileNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { y: -2 } : { y: 0 }}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StoreCard = ({ store }) => {
  const isOpen = store.isOpen && store.acceptingOrders;

  const getMealIcon = (time) => {
    switch (time) {
      case 'Breakfast': return <Coffee className="w-3.5 h-3.5" />;
      case 'Lunch': return <Sun className="w-3.5 h-3.5" />;
      case 'Dinner': return <Moon className="w-3.5 h-3.5" />;
      default: return <Sun className="w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
    >
      {/* Visual Header / Cover */}
      <div className={`h-24 sm:h-32 bg-gradient-to-r ${isOpen ? 'from-orange-400 to-orange-600' : 'from-gray-300 to-gray-400'} relative`}>
        <div className="absolute top-3 right-3">
          <Badge className={`border-none px-2 py-1 shadow-sm backdrop-blur-md ${isOpen ? 'bg-white/90 text-green-700' : 'bg-black/50 text-white'
            }`}>
            {isOpen ? 'Open Now' : 'Closed'}
          </Badge>
        </div>
        {/* Store Icon Circle */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl shadow-md p-1 flex items-center justify-center">
            <div className="w-full h-full bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
              <Store className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-8 sm:pt-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {store.storeName}
            </h3>
            <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{store.storeAddress}</span>
            </div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {getMealIcon(store.activeMealTime)}
            Serving {store.activeMealTime}
          </div>
          {store.rating && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
              ★ {store.rating}
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          {isOpen ? (
            <Link to={`/order/${store.id}`} className="block w-full">
              <Button className="w-full bg-gray-900 group-hover:bg-orange-600 text-white transition-colors rounded-xl h-10 sm:h-11 font-semibold shadow-sm">
                Order Food
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full bg-gray-100 text-gray-400 border border-gray-200 rounded-xl h-10 sm:h-11">
              Currently Unavailable
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const OrderHistoryCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'preparing':
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{order.store_name}</h4>
            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <Badge variant="outline" className={`border ${getStatusColor(order.status)}`}>
          {order.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="font-bold text-gray-900">LKR {Number(order.total).toFixed(2)}</span>
        <Link to={`/receipt/${order.id}`}>
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 text-xs font-semibold">
            View Receipt <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const CustomerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
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
      // Fetch Stores
      const resStores = await fetch(`/api/merchant/list.php${user.university_id ? `?university_id=${user.university_id}` : ''}`);
      const dataStores = await resStores.json();

      if (dataStores.success) {
        let merchants = dataStores.data;
        if (user.university_id) {
          merchants = merchants.filter(m => Number(m.university_id) === Number(user.university_id));
        }
        setStores(merchants.map(merchant => ({
          id: merchant.id,
          storeName: merchant.store_name,
          storeAddress: merchant.store_address,
          isOpen: merchant.is_open == 1,
          acceptingOrders: merchant.accepting_orders == 1,
          activeMealTime: merchant.active_meal_time || 'Lunch',
          rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Mock rating for visual
        })));
      }

      // Fetch Orders
      const resOrders = await fetch('/api/orders/list.php');
      const dataOrders = await resOrders.json();
      if (dataOrders.ok) setOrders(dataOrders.orders);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [user, navigate, loading]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-pulse text-orange-500 font-medium">Loading QuickMeal...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 font-inter pb-20 md:pb-0 flex">
      <Helmet><title>Dashboard - QuickMeal</title></Helmet>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 text-orange-600">
            <Store className="w-8 h-8 fill-current" />
            <span className="text-2xl font-black tracking-tight text-gray-900">QuickMeal</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Home className="w-5 h-5" /> Home
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Receipt className="w-5 h-5" /> My Orders
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'account' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="w-5 h-5" /> Account
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto md:p-8 p-4">

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 pt-2">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name} 👋</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
            {user?.name?.charAt(0)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="bg-gray-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                    Hungry? <br /> Let's get some food.
                  </h2>
                  <p className="text-gray-300 mb-6">Explore the best food spots around {user?.university_name || 'your university'}.</p>
                  <Button onClick={() => document.getElementById('stores-grid').scrollIntoView({ behavior: 'smooth' })} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                    Browse Restaurants
                  </Button>
                </div>
                {/* Decorative Blob */}
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              </div>

              {/* Stores Grid */}
              <div id="stores-grid">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Nearby Restaurants</h3>
                  <Badge variant="secondary" className="bg-white text-gray-600 border-gray-200">
                    {stores.filter(s => s.isOpen && s.acceptingOrders).length} Active
                  </Badge>
                </div>

                {stores.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
                    <Store className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No restaurants available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map(store => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
                  <p className="text-gray-500 mt-2 max-w-xs mx-auto">Looks like you haven't placed any orders yet. Go ahead and treat yourself!</p>
                  <Button onClick={() => setActiveTab('dashboard')} className="mt-6 bg-orange-600 hover:bg-orange-700">
                    Browse Food
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {orders.map(order => (
                    <OrderHistoryCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">My Account</h2>
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-orange-50 border border-orange-100 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 shadow-lg">
                  {user?.name?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-500 mb-6">{user?.email}</p>

                <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">University</p>
                  <p className="font-medium text-gray-800">{user?.university_name || 'Not set'}</p>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl"
                >
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default CustomerDashboard;