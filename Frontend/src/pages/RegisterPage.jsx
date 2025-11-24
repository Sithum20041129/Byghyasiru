import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ChefHat, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: null, // ✅ null instead of ""
    storeName: '',
    storeAddress: '',
    university_id: null
  });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/universities.php');
        const data = await res.json();
        if (data.ok) {
          setUniversities(data.universities || []);
        } else {
          setUniversities([]);
        }
      } catch {
        setUniversities([]);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Passwords do not match',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'customer',
        university_id: formData.university_id || null,
        ...(formData.role === 'merchant' && {
          storeName: formData.storeName,
          storeAddress: formData.storeAddress
        })
      };

      const user = await register(userData);

      if (formData.role === 'customer') {
        toast({ title: 'Account Created!', description: 'Welcome to QuickMeal!' });
        navigate('/customer');
      } else if (formData.role === 'merchant') {
        toast({
          title: 'Registration Submitted',
          description: 'Your merchant account is pending admin approval.'
        });
        navigate('/login');
      } else {
        toast({ title: 'Registered', description: 'Account created' });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Sign Up - QuickMeal</title>
      </Helmet>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>

          <Card className="meal-card shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ChefHat className="w-12 h-12 text-orange-500" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">
                Join QuickMeal
              </CardTitle>
              <CardDescription>Create your account to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select
                    value={formData.role ?? ''}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, role: v }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="merchant">Restaurant Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'customer' && (
                  <div className="space-y-2">
                    <Label htmlFor="university">University (optional)</Label>
                    <Select
                      value={formData.university_id ? String(formData.university_id) : ''}
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          university_id: v ? parseInt(v) : null
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.role === 'merchant' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Restaurant Name</Label>
                      <Input
                        id="storeName"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeAddress">Restaurant Address</Label>
                      <Input
                        id="storeAddress"
                        name="storeAddress"
                        value={formData.storeAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeUniversity">Restaurant University (required)</Label>
                      <Select
                        value={formData.university_id ? String(formData.university_id) : ''}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            university_id: v ? parseInt(v) : null
                          }))
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
