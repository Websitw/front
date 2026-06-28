import React from "react";
import "./NotificationDrawer.css";
import Notification_2 from '../../assets/icons/Notification_2.png'

import Notification_3 from '../../assets/icons/Notification_3.png'

const notifications = {
  new: [
    {
      id: 1,
      title: "Order Shipped",
      icon: Notification_2,
      time: "1 Hour Ago",
      message:
        "your order #12345 is on its way! track your package here.",
    },
    {
      id: 2,
      title: "Order Confirmed",
      icon: Notification_3,
      time: "1 Month Ago",
      message:
        "great news! your order #12345 has been confirmed and is being prepared.",
    },
    {
        id: 1,
        title: "Order Shipped",
        icon: Notification_2,
        time: "1 Hour Ago",
        message:
          "your order #12345 is on its way! track your package here.",
      },
      {
        id: 2,
        title: "Order Confirmed",
        icon: Notification_3,
        time: "1 Month Ago",
        message:
          "great news! your order #12345 has been confirmed and is being prepared.",
      },
  ],
  oldest: [
    {
      id: 3,
      title: "Order Confirmed",
      icon: Notification_3,
      time: "1 Month Ago",
      message:
        "great news! your order #12345 has been confirmed and is being prepared.",
    },
    {
      id: 4,
      title: "Order Confirmed",
      icon: Notification_3,
      time: "1 Month Ago",
      message:
        "great news! your order #12345 has been confirmed and is being prepared.",
    },
  ],
};

const NotificationItem = ({ item, highlight }) => (
  <div
    className={`notification-item ${
      highlight ? "notification-item--highlight" : ""
    }`}
  >
    <div className="notification-item__header">
      <div className="notification-item__title">
        <img className="notification-item__icon" src={item.icon} />
        <strong className="notification-title">{item.title}</strong>
      </div>

      <span className="notification-item__time">{item.time}</span>
    </div>

    <p className="notification-item__message">{item.message}</p>

    <button className="notification-item__link">
      View Order Details
    </button>
  </div>
);

const NotificationDrawer = ({ open, onClose }) => {
  return (
    <>
    
      <div
        className={`notification-overlay ${
          open ? "notification-overlay--show" : ""
        }`}
        onClick={onClose}
      />

      <div
        className={`notification-drawer ${
          open ? "notification-drawer--open" : ""
        }`}
      >
        <div className="notification-drawer__content">
          <h2 className="notification-drawer__title">
            Notification
          </h2>

          <p className="notification-section">NEW</p>

          {notifications.new.map((item, index) => (
            <NotificationItem
              key={item.id}
              item={item}
              highlight={index === 0}
            />
          ))}

          <hr />

          <p className="notification-section">OLDEST</p>

          {notifications.oldest.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;