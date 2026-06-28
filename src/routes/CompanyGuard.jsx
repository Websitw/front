import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectIsInitialized } from "../store/slices/authSlice";
import Loading from "../components/Loading/Loading";
import axiosInstance from "../config/axiosInstance";

const CompanyGuard = () => {
  const user = useSelector(selectUser);
  const isInitialized = useSelector(selectIsInitialized);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
// console.log("User in CompanyGuard:", user);
//   useEffect(() => {
//     const checkCompanyStatus = async () => {
//       if (!user || !user.id) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const statusData = await axiosInstance.get(
//           `companies?q=properties.userId:${user.id}`,
//         );
//         const status = statusData?.data?.items[0]?.status;
//         setIsActive(status === "ACTIVE");
//       } catch (error) {
//         console.error("Error fetching company status:", error);
//         setIsActive(false);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkCompanyStatus();
//   }, [user]);

  if (!isInitialized || isLoading) {
    return (
      <div className="loading-page-loading">
        <Loading loadingPages={true} />
      </div>
    );
  }

  // if (!isActive) {
  //   return <Navigate to="/CompanyRequest" replace />;
  // }

  return <Outlet />;
};

export default CompanyGuard;
