// import React from "react";
// import "./Footer.css";
// import PhoneIcon from "@mui/icons-material/Phone";
// import EmailIcon from "@mui/icons-material/Email";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import GoogleIcon from "@mui/icons-material/Google";
// import AppleIcon from "@mui/icons-material/Apple";
// import CreditCardIcon from "@mui/icons-material/CreditCard";
// import PaymentIcon from "@mui/icons-material/Payment";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

// const Footer = () => {
//   return (
//     <div style={{backgroundColor :'#f9f9fc'}}>
//         <div style={{maxWidth:'1400px' , margin:' 0 auto'}}>
//     <footer className="footer ">
//       <div className="newsletter">
//         <div className="newsletter-text">
//           <h3>Join our newsletter for £10 offs</h3>
//         </div>

//         <div className="newsletter-input">
//           <input type="email" placeholder="Enter your email address" />
//           <button>SEND</button>
//         </div>
//       </div>

//       <hr />


//       <div className="footer-content">
       
//         <div className="footer-col">
//           <h4>Do You Need Help ?</h4>
        
//         </div>

//         <div className="footer-col">
//           <h4>Make Money with Us</h4>
//           <ul>
//             <li>Sell on Grogin</li>
//             <li>Sell Your Services on Grogin</li>
//             <li>Sell on Grogin Business</li>
//             <li>Sell Your Apps on Grogin</li>
//             <li>Become an Affiliate</li>
//             <li>Advertise Your Products</li>
//             <li>Self-Publish with Us</li>
//             <li>Become an Blovwe Vendor</li>
//           </ul>
//         </div>

//         <div className="footer-col">
//           <h4>Let Us Help You</h4>
//           <ul>
//             <li>Accessibility Statement</li>
//             <li>Your Orders</li>
//             <li>Returns & Replacements</li>
//             <li>Shipping Rates & Policies</li>
//             <li>Refund and Returns Policy</li>
//             <li>Privacy Policy</li>
//             <li>Terms and Conditions</li>
//             <li>Cookie Settings</li>
//             <li>Help Center</li>
//           </ul>
//         </div>

//         <div className="footer-col">
//           <h4>Get to Know Us</h4>
//           <ul>
//             <li>Careers for Grogin</li>
//             <li>About Grogin</li>
//             <li>Investor Relations</li>
//             <li>Grogin Devices</li>
//             <li>Customer Reviews</li>
//             <li>Social Responsibility</li>
//             <li>Store Locations</li>
//           </ul>
//         </div>

//         <div className="footer-col">
//           <h4>Download our app</h4>
//           <div className="app-buttons">
//             <div className="app-store">
//               <GoogleIcon />
//               <span>Google Play</span>
//             </div>
//             <div className="app-store">
//               <AppleIcon />
//               <span>App Store</span>
//             </div>
//           </div>

//           <h4>Follow us on social media:</h4>
//           <div className="social-icons">
//             <FacebookIcon />
//             <InstagramIcon />
//             <LinkedInIcon />
//           </div>
//         </div>
//       </div>

//       <hr />

//       <div className="footer-bottom">
//         <p>
//           Copyright © 2025 Shopstore WooCommerce WordPress Theme. All rights
//           reserved. Powered by <span>BlackRise Themes</span>.
//         </p>
//         <div className="payment-icons">
//           <CreditCardIcon />
//           <PaymentIcon />
//           <AccountBalanceIcon />
//         </div>
//       </div>

//       <div className="footer-links">
//         <a href="#">Terms and Conditions</a>
//         <a href="#">Privacy Policy</a>
//         <a href="#">Order Tracking</a>
//       </div>
//     </footer>
//     </div>
//     </div>
//   );
// };

// export default Footer;

import React from "react";
import "./Footer.css";
import { useTranslation } from "react-i18next";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div style={{ backgroundColor: "#f9f9fc" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <footer className="footer">
          {/* Newsletter Section */}
          <div className="newsletter">
            <div className="newsletter-text">
              <h3>{t("footer.newsletter_title")}</h3>
            </div>

            <div className="newsletter-input">
              <input
                type="email"
                placeholder={t("footer.email_placeholder")}
              />
              <button>{t("footer.send_button")}</button>
            </div>
          </div>

          <hr />

          {/* Footer Columns */}
          <div className="footer-content">
            <div className="footer-col">
              <h4>{t("footer.need_help")}</h4>
            </div>

            <div className="footer-col">
              <h4>{t("footer.make_money")}</h4>
              <ul>
                <li>{t("footer.sell_on_grogin")}</li>
                <li>{t("footer.sell_services")}</li>
                <li>{t("footer.sell_business")}</li>
                <li>{t("footer.sell_apps")}</li>
                <li>{t("footer.become_affiliate")}</li>
                <li>{t("footer.advertise_products")}</li>
                <li>{t("footer.self_publish")}</li>
                <li>{t("footer.become_vendor")}</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t("footer.help_you")}</h4>
              <ul>
                <li>{t("footer.accessibility")}</li>
                <li>{t("footer.orders")}</li>
                <li>{t("footer.returns")}</li>
                <li>{t("footer.shipping")}</li>
                <li>{t("footer.refund")}</li>
                <li>{t("footer.privacy")}</li>
                <li>{t("footer.terms")}</li>
                <li>{t("footer.cookies")}</li>
                <li>{t("footer.help_center")}</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t("footer.get_to_know")}</h4>
              <ul>
                <li>{t("footer.careers")}</li>
                <li>{t("footer.about")}</li>
                <li>{t("footer.investor")}</li>
                <li>{t("footer.devices")}</li>
                <li>{t("footer.reviews")}</li>
                <li>{t("footer.social_responsibility")}</li>
                <li>{t("footer.locations")}</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t("footer.download_app")}</h4>
              <div className="app-buttons">
                <div className="app-store">
                  <GoogleIcon />
                  <span>{t("footer.google_play")}</span>
                </div>
                <div className="app-store">
                  <AppleIcon />
                  <span>{t("footer.app_store")}</span>
                </div>
              </div>

              <h4>{t("footer.follow_us")}</h4>
              <div className="social-icons">
                <FacebookIcon />
                <InstagramIcon />
                <LinkedInIcon />
              </div>
            </div>
          </div>

          <hr />

          <div className="footer-bottom">
            <p>{t("footer.copyright")}</p>
            <div className="payment-icons">
              <CreditCardIcon />
              <PaymentIcon />
              <AccountBalanceIcon />
            </div>
          </div>

          <div className="footer-links">
            <a href="#">{t("footer.terms")}</a>
            <a href="#">{t("footer.privacy")}</a>
            <a href="#">{t("footer.order_trackingg")}</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
