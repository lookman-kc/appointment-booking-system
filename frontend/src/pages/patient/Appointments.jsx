import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { listMyAppointments, cancelAppointment } from "@/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);

  const load = async () => {
    const res = await listMyAppointments();
    setAppointments(res.data.appointments);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const confirmCancel = async () => {
    const appointment = pendingCancel;
    setPendingCancel(null);
    setCancelling(appointment._id);
    try {
      await cancelAppointment(appointment._id);
      toast.success("Appointment cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.doctorId?.name}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.startTime} - {a.endTime}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "booked" ? "default" : "secondary"}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.status === "booked" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancelling === a._id}
                          onClick={() => setPendingCancel(a)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingCancel} onOpenChange={(open) => !open && setPendingCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your {pendingCancel?.startTime} appointment with {pendingCancel?.doctorId?.name} on{" "}
              {pendingCancel?.date}. The slot will become available to other patients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Cancel appointment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
