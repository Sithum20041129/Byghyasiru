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

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,30C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    storeName: '',
    storeAddress: '',
    university: null // Change initial state to null
  });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUniversities = JSON.parse(localStorage.getItem('quickmeal_universities') || '[]');
    setUniversities(storedUniversities);
  }, []);

  const handleGoogleSignup = () => {
    toast({
      title: 'Coming Soon!',
      description: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Password Mismatch', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }

      const users = JSON.parse(localStorage.getItem('quickmeal_users') || '[]');
      const existingUserByEmail = users.find(u => u.email === formData.email);
      const existingUserByUsername = users.find(u => u.username === formData.username);

      if (existingUserByEmail) {
        toast({ title: 'Email Already Exists', description: 'An account with this email already exists', variant: 'destructive' });
        return;
      }
      
      if (existingUserByUsername) {
        toast({ title: 'Username Already Exists', description: 'An account with this username already exists', variant: 'destructive' });
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'customer' && { university: formData.university }), // university can be null
        ...(formData.role === 'merchant' && {
          storeName: formData.storeName,
          storeAddress: formData.storeAddress
        })
      };

      register(userData);

      if (formData.role === 'customer') {
        toast({ title: 'Account Created!', description: 'Welcome to QuickMeal!' });
        navigate('/customer');
      } else if (formData.role === 'merchant') {
        toast({ title: 'Registration Submitted', description: 'Your merchant account is pending admin approval.' });
        navigate('/login');
      }
    } catch (error) {
      toast({ title: 'Registration Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value })); // Convert "null" string back to actual null
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Sign Up - QuickMeal</title>
        <meta name="description" content="Create your QuickMeal account and start pre-ordering meals or register your restaurant." />
        <meta property="og:title" content="Sign Up - QuickMeal" />
        <meta property="og:description" content="Create your QuickMeal account and start pre-ordering meals or register your restaurant." />
      </Helmet>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="meal-card shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ChefHat className="w-12 h-12 text-orange-500" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">Join QuickMeal</CardTitle>
              <CardDescription className="text-gray-600">
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select onValueChange={(value) => handleSelectChange('role', value)} required>
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
                    <Label htmlFor="university">University (Optional)</Label>
                    <Select value={formData.university === null ? "null" : formData.university} onValueChange={(value) => handleSelectChange('university', value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {universities.map(uni => (
                          <SelectItem key={uni.id} value={uni.name}>{uni.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.role === 'merchant' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Restaurant Name</Label>
                      <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeAddress">Restaurant Address</Label>
                      <Input id="storeAddress" name="storeAddress" value={formData.storeAddress} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="border-orange-200 focus:border-orange-400" />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/95 px-2 text-gray-500">Or continue with</span></div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;