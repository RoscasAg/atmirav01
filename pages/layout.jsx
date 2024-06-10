import { useState, useEffect, useContext } from "react";
import { instrumentSans } from "../styles/fonts";
import AppNotificationContext from "../store/notification-context";
import Notification from "./components/ui/notification";

export default function RootLayout({ children }) {
  const notificationCtx = useContext(AppNotificationContext);

  const activeNotification = notificationCtx.notification;

  return (
    <>
      <div className={`flex flex-row ${instrumentSans.className}`}>
        <div className="w-full md:w-3/4 p-8 relative">
          {/* Main content */}
          {children}
        </div>
        {activeNotification && (
          <Notification
            title={activeNotification.title}
            message={activeNotification.message}
            status={activeNotification.status}
          />
        )}
      </div>
    </>
  );
}
