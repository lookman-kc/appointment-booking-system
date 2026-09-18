import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listDoctorsPatient, listSlots, bookAppointment } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const initials = (name) =>
  name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const PERIODS = [
  { label: "Morning", test: (hour) => hour < 12 },
  { label: "Afternoon", test: (hour) => hour >= 12 && hour < 17 },
  { label: "Evening", test: (hour) => hour >= 17 },
];

const groupByPeriod = (slots) => {
  return PERIODS.map((period) => ({
    label: period.label,
    slots: slots.filter((slot) => period.test(Number(slot.startTime.slice(0, 2)))),
  })).filter((group) => group.slots.length > 0);
};

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

  const groupedSlots = groupByPeriod(slots);

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
              {doctors.map((d) => {
                const isSelected = selectedDoctor?._id === d._id;
                return (
                  <button
                    key={d._id}
                    onClick={() => selectDoctor(d)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                      isSelected ? "border-l-4 border-l-accent bg-muted" : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback className="bg-secondary text-secondary-foreground">{initials(d.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="truncate text-sm text-muted-foreground">{d.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Available slots for {selectedDoctor.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
            ) : groupedSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this date.</p>
            ) : (
              <div className="space-y-4">
                {groupedSlots.map((group) => (
                  <div key={group.label} className="flex gap-4">
                    <div className="w-20 shrink-0 pt-2 text-sm text-muted-foreground">{group.label}</div>
                    <div className="flex-1 border-l pl-4">
                      <div className="flex flex-wrap gap-2">
                        {group.slots.map((slot) => (
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
                    </div>
                  </div>
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
