import { CalendarCheck, LogOut, Stethoscope, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ADMIN_SECTIONS = [
  {
    label: "People",
    items: [
      { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
      { to: "/admin/patients", label: "Patients", icon: Users },
    ],
  },
  {
    label: "Scheduling",
    items: [{ to: "/admin/appointments", label: "Appointments", icon: CalendarCheck }],
  },
];

const PATIENT_SECTIONS = [
  {
    label: "Book",
    items: [{ to: "/patient/doctors", label: "Find a Doctor", icon: Stethoscope }],
  },
  {
    label: "My Care",
    items: [{ to: "/patient/appointments", label: "My Appointments", icon: CalendarCheck }],
  },
];

const initials = (name) =>
  name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sections = user?.role === "admin" ? ADMIN_SECTIONS : PATIENT_SECTIONS;

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Stethoscope className="size-4" />
          </div>
          <span className="truncate font-heading text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Ledger
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={
                          isActive
                            ? "border-l-2 border-sidebar-primary bg-sidebar-accent pl-1.5 font-medium text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
                            : "border-l-2 border-transparent pl-1.5"
                        }
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8">
            <AvatarFallback>{initials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs capitalize text-muted-foreground">{user?.role}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 group-data-[collapsible=icon]:hidden"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
