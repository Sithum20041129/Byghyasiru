import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

export default function CompleteProfile() {
    const [loading, setLoading] = useState(true);
    const [universities, setUniversities] = useState([]); // <--- 1. New State for Universities
    const [formData, setFormData] = useState({
        role: "customer",
        university_id: "",
        store_name: "",
        store_address: ""
    });
    const [googleUser, setGoogleUser] = useState(null);
    const { toast } = useToast();

    // 2. Fetch User Data AND Universities
    useEffect(() => {
        // Fetch User
        fetch("https://aqua-horse-753666.hostingersite.com/api/auth/get_temp_user.php") // <--- Changed to relative path
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
        fetch("https://aqua-horse-753666.hostingersite.com/api/admin/universities.php") // <--- Fetching real data
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

        const response = await fetch("https://aqua-horse-753666.hostingersite.com/api/auth/register.php", { // <--- Changed to relative path
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

    if (loading) return <div className="p-10 text-center">Loading profile data...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
                <p className="text-gray-600 mb-6">Hi {googleUser.name}, we just need a few more details.</p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label>I am a...</Label>
                        <RadioGroup
                            defaultValue="customer"
                            onValueChange={(val) => setFormData({ ...formData, role: val })}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="customer" id="r1" />
                                <Label htmlFor="r1">Customer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="merchant" id="r2" />
                                <Label htmlFor="r2">Merchant</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* University Selection */}
                    <div className="space-y-2">
                        <Label>Select University</Label>
                        <select
                            className="w-full border p-2 rounded"
                            onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                            required
                        >
                            <option value="">-- Select University --</option>
                            {/* 3. Dynamic Rendering of Universities */}
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Merchant Only Fields */}
                    {formData.role === 'merchant' && (
                        <>
                            <div className="space-y-2">
                                <Label>Store Name</Label>
                                <Input
                                    required
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Store Address</Label>
                                <Input
                                    required
                                    onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <Button type="submit" className="w-full mt-4">Complete Registration</Button>
                </form>
            </div>
        </div>
    );
}