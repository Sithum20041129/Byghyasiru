import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Settings } from 'lucide-react';

const AccountSettingsTab = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: null // Change initial state to null
  });

  useEffect(() => {
    const storedUniversities = JSON.parse(localStorage.getItem('quickmeal_universities') || '[]');
    setUniversities(storedUniversities);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        university: user.university || null // Initialize with null if university is empty
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUniversityChange = (value) => {
    setFormData(prev => ({ ...prev, university: value === "null" ? null : value })); // Convert "null" string back to actual null
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUserData = {
      ...user,
      name: formData.name,
      university: formData.university // Will be null or selected university name
    };
    updateUser(updatedUserData);
    toast({
      title: 'Account Updated',
      description: 'Your account details have been saved.'
    });
  };

  return (
    <Card className="store-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={formData.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Select value={formData.university === null ? "null" : formData.university} onValueChange={handleUniversityChange}>
              <SelectTrigger>
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
          <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsTab;