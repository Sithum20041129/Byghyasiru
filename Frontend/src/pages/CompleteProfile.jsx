import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Store, Building2, MapPin, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

export default function CompleteProfile() {
    const [loading, setLoading] = useState(true);
    const [universities, setUniversities] = useState([]);
    const [formData, setFormData] = useState({
        role: "customer",
        university_id: "",
        store_name: "",
        store_address: ""
    });
    const [googleUser, setGoogleUser] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        // Fetch User
        fetch("https://aqua-horse-753666.hostingersite.com/api/auth/get_temp_user.php")
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setGoogleUser(data.user);
                    setLoading(false);
                } else {
                    window.location.href = "/login";
                }
            })
            .catch(() => window.location.href = "/login");

        // Fetch Universities
        fetch("https://aqua-horse-753666.hostingersite.com/api/admin/universities.php")
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setUniversities(data.universities || []);
                }
            })
            .catch(err => console.error("Failed to load universities", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.role === 'customer' && !formData.university_id) {
            toast({ title: "Required", description: "Please select your university", variant: "destructive" });
            return;
        }
        if (formData.role === 'merchant') {
            if (!formData.store_name) {
                toast({ title: "Required", description: "Please enter store name", variant: "destructive" });
                return;
            }
            if (!formData.university_id) { // Assuming merchants might also need to belong to a uni area, or maybe not. Keeping consistent with previous logic if it was required. 
                // Actually looking at previous code, merchants didn't seemingly use university_id explicitly but the select was there. 
                // Let's assume University is required for everyone as it's the delivery service area.
                toast({ title: "Required", description: "Please select the university/campus area", variant: "destructive" });
                return;
            }
        }

        const response = await fetch("https://aqua-horse-753666.hostingersite.com/api/auth/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...formData,
                email: googleUser.email,
                username: googleUser.name,
                name: googleUser.name,
                password: "",
                google_id: googleUser.google_id,
                is_google_register: true
            }),
        });

        const result = await response.json();
        if (result.ok) {
            if (formData.role === 'merchant') {
                window.location.href = "/login?error=pending_approval";
            } else {
                window.location.href = "/customer";
            }
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-500 font-medium tracking-wide">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
            <Card className="w-full max-w-2xl shadow-xl border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Complete Your Profile
                    </CardTitle>
                    <CardDescription className="text-base text-gray-500 mt-2">
                        Welcome, <span className="font-semibold text-gray-800">{googleUser?.name}</span>! Let's get you set up.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Role Selection */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">I want to join as a...</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer Option */}
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                                    className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center text-center space-y-3 hover:shadow-md ${formData.role === 'customer'
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-100 bg-white hover:border-orange-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${formData.role === 'customer' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${formData.role === 'customer' ? 'text-gray-900' : 'text-gray-600'}`}>Customer</h3>
                                        <p className="text-xs text-gray-500 mt-1">Order delicious meals</p>
                                    </div>
                                    {formData.role === 'customer' && (
                                        <div className="absolute top-3 right-3 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
                                    )}
                                </div>

                                {/* Merchant Option */}
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'merchant' })}
                                    className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center text-center space-y-3 hover:shadow-md ${formData.role === 'merchant'
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-100 bg-white hover:border-orange-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${formData.role === 'merchant' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Store size={32} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${formData.role === 'merchant' ? 'text-gray-900' : 'text-gray-600'}`}>Merchant</h3>
                                        <p className="text-xs text-gray-500 mt-1">Sell your best food</p>
                                    </div>
                                    {formData.role === 'merchant' && (
                                        <div className="absolute top-3 right-3 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Animated Form Fields */}
                        <div className="space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">

                            {/* University Selection */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-gray-700">
                                    <GraduationCap className="h-4 w-4 text-orange-500" />
                                    Select University
                                </Label>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, university_id: val })}
                                    required
                                >
                                    <SelectTrigger className="w-full h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                                        <SelectValue placeholder="Choose your campus..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universities.map((uni) => (
                                            <SelectItem key={uni.id} value={String(uni.id)}>
                                                {uni.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Merchant Fields */}
                            {formData.role === 'merchant' && (
                                <div className="space-y-5 pt-2 border-t border-gray-100 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-700">
                                            <Building2 className="h-4 w-4 text-orange-500" />
                                            Store Name
                                        </Label>
                                        <Input
                                            required
                                            placeholder="e.g. Grandma's Kitchen"
                                            className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-700">
                                            <MapPin className="h-4 w-4 text-orange-500" />
                                            Store Address
                                        </Label>
                                        <Input
                                            required
                                            placeholder="Building, Street, City..."
                                            className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Complete Registration
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}