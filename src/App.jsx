import { useRoutes } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import "./styles/responsive.css";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { selectIsInitialized, checkAuth } from "./store/slices/authSlice";
import routes from "./routes";
import Loading from "./components/Loading/Loading";
import "react-toastify/dist/ReactToastify.css";
import useTokenRefresh from "./hooks/useTokenRefresh";
import { ViewProductProvider } from "./context/ViewProductContext";
import { setModalCallback } from "./config/axiosInstance";

const SessionExpiredModal = lazy(() => import("./components/Expiredmodal/Expiredmoal"));

const App = () => {

  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);
  const routing = useRoutes(routes);
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [showSessionModal, setShowSessionModal] = useState(false);

  useTokenRefresh({
    onSessionExpired: () => setShowSessionModal(true),
  });
  const isRTL = currentLang === "ar";

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userData" || e.key === null) {
        dispatch(checkAuth());
      }
    };

    const handleAuthChange = () => {
      dispatch(checkAuth());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, [dispatch]);

  useEffect(() => {
    setModalCallback(() => setShowSessionModal(true));

    return () => setModalCallback(null);
  }, []);

  if (!isInitialized) {
    return (
      <div className="loading-page-loading">
        <Loading loadingPages={true} />
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        rtl={isRTL}
        position={"bottom-left"}
        // position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        theme="light"
        limit={3}
        style={{
          zIndex: 99999999,
        }}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
      />
      {showSessionModal ? (
        <Suspense fallback={null}>
          <SessionExpiredModal
            open={showSessionModal}
            onClose={() => setShowSessionModal(false)}
          />
        </Suspense>
      ) : null}
      <ViewProductProvider>{routing}</ViewProductProvider>
    </>
  );
};

export default App;
