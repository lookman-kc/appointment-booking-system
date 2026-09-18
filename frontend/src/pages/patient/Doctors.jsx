import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listDoctorsPatient, listSlots, bookAppointment } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const today = new Date().toISOString().slice(0, 10);

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(null);
  const [pendingSlot, setPendingSlot] = useState(null);

  useEffect(() => {
    listDoctorsPatient().then((res) => {
      setDoctors(res.data.doctors);
      setLoadingDoctors(false);
    });
  }, []);

  const loadSlots = async (doctorId, forDate) => {
    setLoadingSlots(true);
    try {
      const res = await listSlots(doctorId, forDate);
      setSlots(res.data.slots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    loadSlots(doctor._id, date);
  };

  const changeDate = (newDate) => {
    setDate(newDate);
    if (selectedDoctor) loadSlots(selectedDoctor._id, newDate);
  };

  const confirmBook = async () => {
    const slot = pendingSlot;
    setPendingSlot(null);
    setBooking(slot.startTime);
    try {
      await bookAppointment({ doctorId: selectedDoctor._id, date, startTime: slot.startTime });
      toast.success(`Booked ${slot.startTime} with ${selectedDoctor.name}`);
      loadSlots(selectedDoctor._id, date);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDoctors ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <button
                  key={d._id}
                  onClick={() => selectDoctor(d)}
                  className={`rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    selectedDoctor?._id === d._id ? "border-primary bg-accent" : ""
                  }`}
                >
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-muted-foreground">{d.email}</div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Available slots for {selectedDoctor.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => changeDate(e.target.value)} />
            </div>

            {loadingSlots ? (
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.startTime}
                    variant="outline"
                    disabled={booking === slot.startTime}
                    onClick={() => setPendingSlot(slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!pendingSlot} onOpenChange={(open) => !open && setPendingSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm booking</AlertDialogTitle>
            <AlertDialogDescription>
              Book {pendingSlot?.startTime} - {pendingSlot?.endTime} with {selectedDoctor?.name} on {date}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBook}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Doctors;
