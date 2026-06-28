import { SmallLogo } from "../../../assets/icons";
import "./NewSidebar.css";
import {
  Finance,
  Brand,
  Analytics,
  MDashboard,
  MyBrands,
  OrdersAndSales,
  ProductsMangement,
  Promotions,
  Stores,
  Support,
  UserPermissions,
  Purchase,
} from "../../../assets/icons";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const NewSideBar = () => {
  const navItems = [
    { path: "/merchant/dashboard/home", icon: MDashboard, label: "Dashboard" },
    { path: "/dashboard/analytics", icon: Analytics, label: "Analytics" },
    {
      path: "/dashboard/merchants",
      icon: Brand,
      label: "Merchants (Sellers)",
    },
    { path: "/merchant/dashboard/products", icon: ProductsMangement, label: "Products" },
    {
      path: "/dashboard/orders",
      icon: OrdersAndSales,
      label: "Orders Mangments",
    },
    { path: "/dashboard/marketing", icon: Promotions, label: "Marketing" },
    {
      path: "/dashboard/finance",
      icon: Finance,
      label: "Finance",
    },
    {
      path: "/dashboard/purchase",
      icon: Purchase,
      label: "Purchase",
    },
    {
      path: "/dashboard/stores",
      icon: Stores,
      label: "Stores",
    },
    {
      path: "/merchant/dashboard/my-brands",
      icon: MyBrands,
      label: "My Brands",
    },
    { path: "/dashboard/support", icon: Support, label: "Support" },
    {
      path: "/dashboard/users",
      icon: UserPermissions,
      label: "Users Permissions",
    },
  ];

  const dividerPositions = [1, 4, 7, 10];
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="sidebar-user-container">
      <div className="sidebar-merchant">
        <div className="brand-wrapper-merchant">
          <div className="brand-trigger-merchant">
            <SmallLogo />
          </div>
        </div>
        <nav className="nav-menu">
          {navItems.map((item, index) => (
            <div key={item.path} style={{
              marginBottom:'8px'
            }}>
              <Link
                to={item.path}
                className={`nav-link ${currentPath === item.path ? "active" : ""}`}
                data-label={item.label}
              >
                <div className="icon">
                  <item.icon />
                </div>
              </Link>
              {dividerPositions.includes(index) && (
                <div className="nav-divider"></div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NewSideBar;