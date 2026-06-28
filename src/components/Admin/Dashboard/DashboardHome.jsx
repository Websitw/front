import NavbarDashboard from "./Navbar/DashboardNavbar";
// import StatsCards from "./Stats/StatsCards";
import "./DashboardHome.css";

const DashboardHome = () => {
  return (
    <div className="dashboard-page">
      <NavbarDashboard />
      {/* <StatsCards /> */}
    </div>
  );
};

export default DashboardHome;
