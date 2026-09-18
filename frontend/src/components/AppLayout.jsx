import AppSidebar from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const PAGE_TITLES = {
  "/admin/doctors": "Doctors",
  "/admin/patients": "Patients",
  "/admin/appointments": "Appointments",
  "/patient/doctors": "Find a Doctor",
  "/patient/appointments": "My Appointments",
};

const AppLayout = ({ children, pathname }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">{PAGE_TITLES[pathname] || "Appointments"}</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
