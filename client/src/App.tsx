import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Notes from "@/pages/Notes";
import Reports from "@/pages/Reports";
import ManageUsers from "@/pages/ManageUsers";
import ManageCourses from "@/pages/ManageCourses";
import Login from "@/pages/Login";
import AppLayout from "@/components/layout/AppLayout";
import { useCurrentUser, isAuthenticated } from "@/lib/auth";

function Router() {
  const { data: user } = useCurrentUser();
  const isAdmin = user?.role === "admin";

  // If not authenticated, show login page
  if (!isAuthenticated()) {
    return (
      <Switch>
        <Route path="*" component={Login} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/courses" component={Courses} />
        <Route path="/notes" component={Notes} />
        <Route path="/reports" component={Reports} />
        {isAdmin && <Route path="/admin/users" component={ManageUsers} />}
        {isAdmin && <Route path="/admin/courses" component={ManageCourses} />}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
