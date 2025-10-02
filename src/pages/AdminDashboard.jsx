import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Users, Store, Clock, PlusCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
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
    loadUsers();
    loadOrders();
    loadUniversities();
    loadPendingMerchants();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setUsers(data.users || []);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders/list.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setOrders(data.orders || []);
    } catch (err) {}
  };

  const loadUniversities = async () => {
    try {
      const res = await fetch('/api/admin/universities.php');
      const json = await res.json();
      if (json.ok) setUniversities(json.universities || []);
      else setUniversities([]);
    } catch (err) {
      setUniversities([]);
    }
  };

  const addUniversity = async () => {
    if (newUniversity.trim() === '') {
      toast({ title: 'Invalid Name', description: 'University name cannot be empty.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/admin/universities.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newUniversity.trim() })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'University Added', description: `${newUniversity.trim()} has been added.` });
        setNewUniversity('');
        loadUniversities();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteUniversity = async (id) => {
    if (!window.confirm('Delete this university? This will not delete merchants but may orphan references.')) return;
    try {
      const res = await fetch('/api/admin/universities.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Deleted', description: 'University removed' });
        loadUniversities();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const loadPendingMerchants = async () => {
    try {
      const res = await fetch('/api/admin/pending_merchants.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setPendingMerchants(data.pending || []);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const approveMerchant = async (merchantId) => {
    try {
      const res = await fetch('/api/admin/approve_merchant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ merchant_id: merchantId })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Approved', description: 'Merchant approved successfully' });
        loadPendingMerchants();
        loadUsers();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const rejectMerchant = async (merchantId) => {
    if (!window.confirm('Rejecting will delete this merchant and their user account. Continue?')) return;
    try {
      const res = await fetch('/api/admin/reject_merchant.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ merchant_id: merchantId })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Rejected', description: 'Merchant rejected and deleted' });
        loadPendingMerchants();
        loadUsers();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const customers = users.filter(u => u.role === 'customer');
  const approvedMerchants = users.filter(u => u.role === 'merchant' && u.approved);

  return (
    <div className="min-h-screen p-4">
      <Helmet><title>Admin Dashboard - QuickMeal</title></Helmet>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage the QuickMeal platform</p>
          </motion.div>
          <Button onClick={logout} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6"><p>Total Customers</p><p className="text-3xl font-bold">{customers.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Active Merchants</p><p className="text-3xl font-bold">{approvedMerchants.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Pending Approvals</p><p className="text-3xl font-bold">{pendingMerchants.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Total Orders</p><p className="text-3xl font-bold">{orders.length}</p></CardContent></Card>
        </motion.div>

        {/* Universities manage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><PlusCircle className="mr-2" />Manage Universities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input type="text" placeholder="New university name..." value={newUniversity} onChange={(e) => setNewUniversity(e.target.value)} />
              <Button onClick={addUniversity} size="icon"><PlusCircle className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {universities.length > 0 ? universities.map(uni => (
                <div key={uni.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span>{uni.name}</span>
                  <Button onClick={() => deleteUniversity(uni.id)} variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )) : <p className="text-sm text-gray-500 text-center">No universities added yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pending Merchants Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Clock className="mr-2" /> Pending Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingMerchants.length > 0 ? (
              <div className="space-y-3">
                {pendingMerchants.map(m => (
                  <div key={m.merchant_id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div>
                      <p className="font-semibold">{m.store_name} ({m.owner_name})</p>
                      <p className="text-sm text-gray-500">{m.email} • {m.university_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => approveMerchant(m.merchant_id)} size="sm" className="bg-green-500 text-white hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button onClick={() => rejectMerchant(m.merchant_id)} size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">No pending merchants.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
