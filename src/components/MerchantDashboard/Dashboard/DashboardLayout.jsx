import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, use } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import "../../Admin/Dashboard/DashboardLayout.css";
import { useDispatch, useSelector } from "react-redux";
import { getMerchantUserStatus } from "../../../store/slices/merchantsuser";
import MerchantInfoForm from "../MerchantForm/MerchantInfoForm";
import Loading from "../../Loading/Loading";
import { showToast } from "../../CustomToast/CustomToast";
import CompleteProfile from "../CompleteProfile/CompleteProfile";
import MerchantNavbar from "../MerchantNavbar/MerchantNavbar";
const DashboardLayout = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRTL = currentLang === "ar";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.merchantsUser);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const userData = JSON.parse(localStorage.getItem("userData"));
    const verStatus = userData?.verStatus;
    if (!verStatus) {
      navigate("/validate-otp");
      showToast.info("Please verify your account to proceed.");
      setInitialLoading(false);
    } else {
      const userId = userData?.id;
      console.log("Fetched userId:", userId);
      if (userId) {
        dispatch(getMerchantUserStatus(userId))
          .unwrap()
          .then((res) => {
            console.log("Merchant User Status Fetched:", res);
            setInitialLoading(false);
            setUser(res?.items[0]);
          })
          .catch((err) => {
            console.error("Error fetching Merchant User Status:", err);
            setInitialLoading(false);
            showToast.error(
              err.message || "Failed to fetch merchant user status",
            );
          });
      } else {
        setInitialLoading(false);
      }
    }
  }, [dispatch]);

  // useEffect(() => {
  //   if (user?.status == "Active") {
  //     navigate("/merchant/dashboard/home");
  //   }
  // }, [user?.status, navigate]);

  // console.log("Merchant User Status:", user);



  if (initialLoading) {
    return (
      <div className="loading-page-loading">
        <Loading loadingPages={true} />
      </div>
    );
  }


  return (
    <>
      {user?.status !== "Active" && !loading && (
        <div>
          <CompleteProfile />
        </div>
      )}

      {(user?.status === "Active" || loading) && (
        <div
          className={`dashboard-container ${
            isRTL ? "dashboard-container-rtl" : "dashboard-container-ltr"
          }`}
        >
          <Sidebar />
          <main
            className={`dashboard-content ${
              isRTL ? "dashboard-content-rtl" : "mercahnt-dashboard-content-ltr"
            }`}
          >
            <MerchantNavbar />

            {loading ? <Loading /> : <Outlet />}
          </main>
        </div>
      )}
    </>
  );
};

export default DashboardLayout;
