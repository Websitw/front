import { lazy } from "react";
import Loadable from "../Loadable";
import PublicGuard from "../PublicGuard";
const SignIn = Loadable(lazy(() => import("../../pages/SignIn/SignIn")));
const SignInAdmin = Loadable(
  lazy(() => import("../../pages/SiginAdmin/SiginAdmin"))
);
const OTP = Loadable(lazy(() => import("../../components/OTP/OTP")));
const PrivacyPolicy = Loadable(
  lazy(() => import("../../components/PrivacyPolicy/PrivacyPolicy"))
);
const CreateMerchant = Loadable(
  lazy(() =>
    import("../../pages/CreateMerchant/CreateMerchant")
  )
);
const OTPnew = Loadable(lazy(() => import("../../components/OTPs/OTP")));
const Congratulations = Loadable(
  lazy(() => import("../../pages/Congratulations/Congratulations"))
);

// const ForgetPassword = Loadable(
//   lazy(() => import("../../components/common/ForgetPassword/ForgetPassword"))
// );
const ForgetPassword = Loadable(
  lazy(() => import("../../components/common/ForgetPassword/ForgetPassword"))
);
const ForgetStep2 = Loadable(
  lazy(() => import("../../components/common/ForgetPassword/ForgetStep2"))
);
const ForgetStep3 = Loadable(
  lazy(() => import("../../components/common/ForgetPassword/ForgetStep3"))
);
const ForgetStep4 = Loadable(
  lazy(() => import("../../components/common/ForgetPassword/ForgetStep4"))
);
const ActiveAdmin = Loadable(
  lazy(() => import("../../components/common/ForgetPassword/ActiveAdmin"))
);

const publicRoutes = [
  {
    // element: <UserLayout />,
    children: [
      {
        element: <PublicGuard />,
        children: [
          {
            path: "/Signin",
            element: <SignIn />,
          },
          {
            path: "/admin",
            element: <SignInAdmin />,
          },
          {
            path: "/create-merchant",
            element: <CreateMerchant />,
          },

          {
            path: "/forget-password",
            element: <ForgetPassword />,
          },
          {
            path: "/forget-password/step2",
            element: <ForgetStep2 />,
          },
          {
            path: "/forget-password/step3",
            element: <ForgetStep3 />,
          },
          {
            path: "/change-password",
            element: <ActiveAdmin />,
          },
          {
            path: "/forget-password/success",
            element: <ForgetStep4 />,
          },
        ],
      },

      {
        path: "/otp",
        element: <OTP />,
      },
      {
        path: "/Privacy Policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/validate-otp",
        element: <OTPnew />,
      },
      {
        path: "/congratulations",
        element: <Congratulations />,
      },
       
    ],
  },
];

export default publicRoutes;
