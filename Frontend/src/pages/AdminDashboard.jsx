import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  LogOut, Users, Store, Clock, PlusCircle, Trash2, 
CheckCircle, XCircle, UserCheck, Package, School
} from 'lucide-react';

const AdminDashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeMerchants, setActiveMerchants] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [universities, setUniversities] = useState([]);
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [newUniversity, setNewUniversity] = useState('');
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadStats();
    loadUniversities();
    loadPendingMerchants();

    const interval = setInterval(() => {
      loadStats();
      loadPendingMerchants();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const [usersRes, merchantsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users.php', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/merchants.php', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/orders/list.php', { credentials: 'include' }).then(r => r.json())
      ]);
  
      console.log('Stats API:', { usersRes, merchantsRes, ordersRes });
  
      if (usersRes.ok) {
        const customers = usersRes.users?.filter(u => u.role === 'customer') || [];
        setTotalCustomers(customers.length);
      }
      if (merchantsRes.ok) {
        const active = merchantsRes.merchants?.filter(m => m.approved == 1) || [];
        setActiveMerchants(active.length);
      }
      if (ordersRes.ok) {
        setTotalOrders(ordersRes.orders?.length || 0);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const loadUniversities = async () => {
    try {
      const res = await fetch('/api/admin/universities.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setUniversities(data.universities || []);
    } catch (err) {
      console.error('Universities error:', err);
    }
  };

  const loadPendingMerchants = async () => {
    try {
      const res = await fetch('/api/admin/pending_merchants.php', { credentials: 'include' });
      const data = await res.json();
      console.log('Pending API:', data);
      if (data.ok) {
        setPendingMerchants(data.pending_merchants || []);
        setPendingApprovals(data.pending_merchants?.length || 0);
      }
    } catch (err) {
      console.error('Pending error:', err);
    }
  };

  const addUniversity = async () => {
    if (!newUniversity.trim()) {
      toast({ title: 'Error', description: 'University name required', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/admin/universities.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newUniversity })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Success', description: 'University added!' });
        setNewUniversity('');
        loadUniversities();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add', variant: 'destructive' });
    }
  };

  const deleteUniversity = async (id) => {
    try {
      const res = await fetch('/api/admin/universities.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Success', description: 'University removed!' });
        loadUniversities();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const approveMerchant = async (id) => {
    try {
      const res = await fetch('/api/admin/approve_merchant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ merchant_id: id })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Approved!', description: 'Merchant can now login.' });
        loadPendingMerchants();
        loadStats();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Approval failed', variant: 'destructive' });
    }
  };

  const rejectMerchant = async (id) => {
    try {
      const res = await fetch('/api/admin/reject_merchant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ merchant_id: id })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Rejected', description: 'Merchant removed.' });
        loadPendingMerchants();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Rejection failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Helmet>
        <title>Admin Dashboard | QuickMeal</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto p-6"
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-600">Admin Dashboard</h1>
            <p className="text-gray-600">Manage the QuickMeal platform</p>
          </div>
          <Button variant="outline" onClick={logout} className="text-orange-600 border-orange-600 hover:bg-orange-50">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Customers</p>
                <p className="text-2xl font-bold text-blue-800">{totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Active Merchants</p>
                <p className="text-2xl font-bold text-green-800">{activeMerchants}</p>
              </div>
              <Store className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-800">{pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-800">{totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Merchant Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <Clock className="mr-2" /> Pending Merchant Approvals ({pendingApprovals})
              </CardTitle>
              <p className="text-sm text-gray-500">Review and approve new merchant applications</p>
            </CardHeader>
            <CardContent>
              {pendingMerchants.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingMerchants.map(m => (
                    <div key={m.merchant_id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{m.store_name}</p>
                          <p className="text-sm text-gray-600">Owner: {m.owner_name} ({m.email})</p>
                          <p className="text-sm text-gray-500">{m.store_address} • {m.university_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveMerchant(m.merchant_id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectMerchant(m.merchant_id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No pending merchant applications</p>
              )}
            </CardContent>
          </Card>

          {/* Manage Universities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <School className="mr-2" /> Manage Universities
              </CardTitle>
              <p className="text-sm text-gray-500">Add or remove universities from the platform</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="New university name..." 
                  value={newUniversity}
                  onChange={(e) => setNewUniversity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addUniversity()}
                />
                <Button onClick={addUniversity}>
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {universities.map(uni => (
                  <div key={uni.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="flex items-center">
                      <School className="w-4 h-4 mr-2 text-blue-500" />
                      {uni.name}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => deleteUniversity(uni.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;