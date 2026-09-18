import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Stethoscope } from "lucide-react";
import { login } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await login(email, password);
      signIn(res.data.token, res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin/doctors" : "/patient/doctors");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Stethoscope className="size-4" />
          </div>
          <span className="font-heading text-base font-semibold tracking-tight">Ledger</span>
        </div>

        <div className="max-w-sm space-y-3">
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight">
            Every appointment, on the record.
          </h1>
          <p className="text-sm text-sidebar-foreground/70">
            Doctors set their hours. Patients book what's open. Nothing gets double-booked.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/50">Appointment Ledger</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Stethoscope className="size-4" />
              </div>
              <span className="font-heading text-base font-semibold tracking-tight">Ledger</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Login</h2>
            <p className="text-sm text-muted-foreground">Sign in to manage or book appointments.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Patient? <Link to="/register" className="font-medium text-foreground underline underline-offset-4">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
