import React from "react";
import { useContext } from "react";
import AppNotificationContext from "../../../store/notification-context";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Notification(props) {
  const notificationCtx = useContext(AppNotificationContext);

  const { title, message, status } = props;

  const handleClose = () => {
    notificationCtx.hideNotification();
  };

  let statusalert = "";

  if (status === "success") {
    statusalert = "success";
  } else if (status === "error") {
    statusalert = "error";
  } else {
    statusalert = "info";
  }

  return (
    <Snackbar open={true} autoHideDuration={6000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={statusalert}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;
