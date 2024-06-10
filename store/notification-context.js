import { createContext, useState, useEffect } from "react";

const AppNotificationContext = createContext({
  notification: null, // { title, message, status }
  showNotification: function (notificationData) {},
  hideNotification: function () {},
});

export function AppNotificationContextProvider(props) {
  const [activeNotification, setActiveNotification] = useState();

  useEffect(() => {
    if (
      activeNotification &&
      (activeNotification.status === "success" ||
        activeNotification.status === "error")
    ) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [activeNotification]);

  function showNotificationHandler(notificationData) {
    setActiveNotification(notificationData);
  }

  function hideNotificationHandler() {
    setActiveNotification(null);
  }

  const context = {
    notification: activeNotification,
    showNotification: showNotificationHandler,
    hideNotification: hideNotificationHandler,
  };

  return (
    <AppNotificationContext.Provider value={context}>
      {props.children}
    </AppNotificationContext.Provider>
  );
}

export default AppNotificationContext;
