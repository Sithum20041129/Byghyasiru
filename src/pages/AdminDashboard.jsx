import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Users, Store, CheckCircle, XCircle, Clock, School as University, PlusCircle, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [newUniversity, setNewUniversity] = useState('');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadUsers();
    loadOrders();
    loadUniversities();
  }, [user, navigate]);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    setUsers(allUsers);
  };

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('quickmeal_orders') || '[]');
    setOrders(allOrders);
  };

  const loadUniversities = () => {
    const allUniversities = JSON.parse(localStorage.getItem('quickmeal_universities') || '[]');
    setUniversities(allUniversities);
  };

  const approveMerchant = (merchantId) => {
    const allUsers = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const updatedUsers = allUsers.map(u => 
      u.id === merchantId ? { ...u, approved: true } : u
    );
    localStorage.setItem('quickmeal_users', JSON.stringify(updatedUsers));
    loadUsers();
    toast({
      title: 'Merchant Approved',
      description: 'The merchant account has been approved successfully'
    });
  };

  const rejectMerchant = (merchantId) => {
    const allUsers = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== merchantId);
    localStorage.setItem('quickmeal_users', JSON.stringify(updatedUsers));
    loadUsers();
    toast({
      title: 'Merchant Rejected',
      description: 'The merchant application has been rejected'
    });
  };

  const handleAddUniversity = () => {
    if (newUniversity.trim() === '') {
      toast({ title: 'Invalid Name', description: 'University name cannot be empty.', variant: 'destructive' });
      return;
    }
    const updatedUniversities = [...universities, { id: uuidv4(), name: newUniversity.trim() }];
    localStorage.setItem('quickmeal_universities', JSON.stringify(updatedUniversities));
    setUniversities(updatedUniversities);
    setNewUniversity('');
    toast({ title: 'University Added', description: `${newUniversity.trim()} has been added.` });
  };

  const handleDeleteUniversity = (id) => {
    const updatedUniversities = universities.filter(uni => uni.id !== id);
    localStorage.setItem('quickmeal_universities', JSON.stringify(updatedUniversities));
    setUniversities(updatedUniversities);
    toast({ title: 'University Removed', description: 'The university has been removed.' });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'See you next time!'
    });
    navigate('/');
  };

  const pendingMerchants = users.filter(u => u.role === 'merchant' && !u.approved);
  const approvedMerchants = users.filter(u => u.role === 'merchant' && u.approved);
  const customers = users.filter(u => u.role === 'customer');

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Admin Dashboard - QuickMeal</title>
        <meta name="description" content="Manage users, approve merchants, and oversee the QuickMeal platform." />
        <meta property="og:title" content="Admin Dashboard - QuickMeal" />
        <meta property="og:description" content="Manage users, approve merchants, and oversee the QuickMeal platform." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage the QuickMeal platform</p>
          </motion.div>
          
          <Button onClick={handleLogout} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="store-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="store-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Merchants</p>
                  <p className="text-3xl font-bold text-green-600">{approvedMerchants.length}</p>
                </div>
                <Store className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="store-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingMerchants.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="store-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="store-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-500" />
                  Pending Merchant Approvals ({pendingMerchants.length})
                </CardTitle>
                <CardDescription>
                  Review and approve new merchant applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingMerchants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending merchant applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingMerchants.map(merchant => (
                      <div key={merchant.id} className="border rounded-lg p-4 bg-white/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{merchant.storeName}</h4>
                            <p className="text-gray-600 mb-1"><strong>Owner:</strong> {merchant.name}</p>
                            <p className="text-gray-600 mb-1"><strong>Email:</strong> {merchant.email}</p>
                            <p className="text-gray-600 mb-1"><strong>Address:</strong> {merchant.storeAddress}</p>
                            <p className="text-gray-600 text-sm"><strong>Applied:</strong> {new Date(merchant.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button onClick={() => approveMerchant(merchant.id)} className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                            <Button onClick={() => rejectMerchant(merchant.id)} variant="destructive"><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="store-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <University className="w-5 h-5 mr-2 text-indigo-500" />
                  Manage Universities
                </CardTitle>
                <CardDescription>Add or remove universities from the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="New university name..."
                    value={newUniversity}
                    onChange={(e) => setNewUniversity(e.target.value)}
                  />
                  <Button onClick={handleAddUniversity} size="icon"><PlusCircle className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {universities.length > 0 ? universities.map(uni => (
                    <div key={uni.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm">{uni.name}</span>
                      <Button onClick={() => handleDeleteUniversity(uni.id)} variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )) : <p className="text-sm text-gray-500 text-center">No universities added yet.</p>}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="store-card">
              <CardHeader>
                <CardTitle className="flex items-center"><Store className="w-5 h-5 mr-2 text-green-500" />Active Merchants ({approvedMerchants.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {approvedMerchants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active merchants</p>
                ) : (
                  <div className="space-y-3">
                    {approvedMerchants.map(merchant => (
                      <div key={merchant.id} className="border rounded-lg p-3 bg-white/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{merchant.storeName}</h4>
                            <p className="text-sm text-gray-600">{merchant.name}</p>
                            <p className="text-xs text-gray-500">{merchant.storeAddress}</p>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="store-card">
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-blue-500" />Customers ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {customers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No registered customers</p>
                ) : (
                  <div className="space-y-3">
                    {customers.map(customer => (
                      <div key={customer.id} className="border rounded-lg p-3 bg-white/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{customer.name}</h4>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-xs text-gray-500">Joined: {new Date(customer.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="secondary">Customer</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminDashboard;