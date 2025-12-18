import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useMerchantConfig } from "@/store/merchantConfig"; // Assuming you have this or use simple state

export default function CompleteProfile() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        role: "customer",
        university_id: "",
        store_name: "",
        store_address: ""
    });
    const [googleUser, setGoogleUser] = useState(null);
    const { toast } = useToast();

    // 1. Fetch the temporary Google data
    useEffect(() => {
        fetch("https://srv1999-files.hstgr.io/b079ebbb07224a73/files/public_html/api/auth/get_temp_user.php")
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setGoogleUser(data.user);
                    setLoading(false);
                } else {
                    // If no temp session, go back to login
                    window.location.href = "/login";
                }
            })
            .catch(() => window.location.href = "/login");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Finalize Registration Endpoint (You need to update api/auth/register.php or create a new one)
        // For now, let's assume we post to your existing register endpoint with a special flag or handle it there
        // Actually, best to use a specific endpoint for Google Finalization
        const response = await fetch("https://srv1999-files.hstgr.io/b079ebbb07224a73/files/public_html/api/auth/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...formData,
                email: googleUser.email,
                username: googleUser.name,
                name: googleUser.name,
                password: "", // No password needed
                google_id: googleUser.google_id,
                is_google_register: true
            }),
        });

        const result = await response.json();
        if (result.ok) {
            // Success! Redirect to dashboard
            if (formData.role === 'merchant') {
                window.location.href = "/login?error=pending_approval"; // Merchants wait
            } else {
                window.location.href = "/customer/dashboard";
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

                    {/* University Selection (Hardcoded for now, or fetch from api/admin/universities.php) */}
                    <div className="space-y-2">
                        <Label>Select University</Label>
                        <select
                            className="w-full border p-2 rounded"
                            onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                            required
                        >
                            <option value="">-- Select University --</option>
                            <option value="1">University of Moratuwa</option>
                            <option value="2">University of Colombo</option>
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