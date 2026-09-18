import { useEffect, useState } from "react";
import { listAppointmentsAdmin } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAppointmentsAdmin().then((res) => {
      setAppointments(res.data.appointments);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.doctorId?.name}</TableCell>
                    <TableCell>{a.patientId?.name}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.startTime} - {a.endTime}</TableCell>
                    <TableCell>
                      <Badge
                        className={a.status === "booked" ? "border-transparent bg-accent text-accent-foreground" : ""}
                        variant={a.status === "booked" ? "default" : "destructive"}
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
