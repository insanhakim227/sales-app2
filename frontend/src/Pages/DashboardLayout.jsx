import Navigation from "../Components/Navigation";
import DashboardHeader from "../Components/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
} 