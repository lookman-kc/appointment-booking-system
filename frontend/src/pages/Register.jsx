import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", dob: "", gender: "" });
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== "")
    );

    try {
      const res = await register(payload);
      signIn(res.data.token, res.data.user);
      navigate("/patient/doctors");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Only name, email and password are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={update("name")} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={form.password} onChange={update("password")} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={form.phone} onChange={update("phone")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of birth (optional)</Label>
              <Input id="dob" type="date" value={form.dob} onChange={update("dob")} />
            </div>

            <div className="space-y-1.5">
              <Label>Gender (optional)</Label>
              <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Prefer not to say" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-foreground underline underline-offset-4">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
