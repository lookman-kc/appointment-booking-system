import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createDoctor, listDoctorsAdmin, setAvailability, listAvailability, updateDoctor, createBreak, listBreaks } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorForm, setDoctorForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [availForm, setAvailForm] = useState({ doctorId: "", date: "", startTime: "09:00", endTime: "17:00" });
  const [availability, setAvailabilityList] = useState([]);
  const [breakForm, setBreakForm] = useState({ doctorId: "", date: "", startTime: "", endTime: "" });
  const [breaks, setBreaks] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadDoctors = async () => {
    const res = await listDoctorsAdmin();
    setDoctors(res.data.doctors);
    setLoadingDoctors(false);
  };

  const loadAvailability = async () => {
    const res = await listAvailability();
    setAvailabilityList(res.data.availability);
  };

  const loadBreaks = async () => {
    const res = await listBreaks();
    setBreaks(res.data.breaks);
  };

  useEffect(() => {
    loadDoctors();
    loadAvailability();
    loadBreaks();
  }, []);

  const doctorName = (id) => doctors.find((d) => d._id === id)?.name || id;

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDoctor(doctorForm);
      toast.success("Doctor added");
      setDoctorForm({ name: "", email: "", password: "", phone: "" });
      loadDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setAvailability(availForm);
      toast.success("Availability set");
      loadAvailability();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set availability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBreak = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createBreak(breakForm);
      const moved = res.data.movedAppointments.length;
      toast.success(moved > 0 ? `Break added — ${moved} appointment(s) moved` : "Break added");
      loadBreaks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add break");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (doctor) => {
    await updateDoctor(doctor._id, { isActive: !doctor.isActive });
    loadDoctors();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Doctor</CardTitle>
          <CardDescription>Admin-managed — doctors don't self-register.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Name" required value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input placeholder="Email" type="email" required value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input placeholder="Password" required value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input placeholder="Phone" value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="w-full">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDoctors ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>{d.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(d)}>
                        {d.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Doctor Availability</CardTitle>
          <CardDescription>Add one or more periods per day (e.g. 9-1 and 2-5).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSetAvailability} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select required value={availForm.doctorId} onValueChange={(value) => setAvailForm({ ...availForm, doctorId: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" required value={availForm.date} onChange={(e) => setAvailForm({ ...availForm, date: e.target.value })} />
            <Input type="time" required value={availForm.startTime} onChange={(e) => setAvailForm({ ...availForm, startTime: e.target.value })} />
            <Input type="time" required value={availForm.endTime} onChange={(e) => setAvailForm({ ...availForm, endTime: e.target.value })} />
            <Button type="submit" disabled={submitting}>Set</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availability.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>{doctorName(a.doctorId)}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.startTime}</TableCell>
                  <TableCell>{a.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Doctor Break</CardTitle>
          <CardDescription>Blocks a time range; existing bookings auto-relocate or the break is rejected.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateBreak} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select required value={breakForm.doctorId} onValueChange={(value) => setBreakForm({ ...breakForm, doctorId: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" required value={breakForm.date} onChange={(e) => setBreakForm({ ...breakForm, date: e.target.value })} />
            <Input type="time" required value={breakForm.startTime} onChange={(e) => setBreakForm({ ...breakForm, startTime: e.target.value })} />
            <Input type="time" required value={breakForm.endTime} onChange={(e) => setBreakForm({ ...breakForm, endTime: e.target.value })} />
            <Button type="submit" disabled={submitting}>Add Break</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaks.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{doctorName(b.doctorId)}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.startTime}</TableCell>
                  <TableCell>{b.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Doctors;
