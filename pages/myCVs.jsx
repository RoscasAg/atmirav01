//Example usinf Firebase Realtime Database
import * as React from "react";
import * as mui from "@mui/material";
import { useState, useEffect, useContext } from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import "react-resizable/css/styles.css";
import MuiAlert from "@mui/material/Alert";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import PDFLoaderv2 from "../store/PDFLoaderCVs";
import AppNotificationContext from "../store/notification-context";
import InfoContext from "../store/Contextinfo";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} size="large" />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

const GridItem = styled(mui.Grid)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    flexBasis: "60%",
  },
}));

const GridPDFLoader = styled(mui.Grid)(({ theme }) => ({
  [theme.breakpoints.up("sm")]: {
    flexBasis: "40%",
  },
}));

function MyDocuments({}) {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const notificationCtx = useContext(AppNotificationContext);
  const {
    nif,
    updateNIF,
    firebaseUserID,
    firebaseApp,
    updateFirebaseuserID,
    initializeFirebase,
    firebaseAppState,
    updateFirebaseAppState,
  } = useContext(InfoContext);

  // Destructure the query parameters from router
  const { customerId = "Z00000300", showInfo = "all" } = router.query;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (error != "" || (documents.length === 0 && !loading)) {
      notificationCtx.showNotification({
        title: "Error!",
        message: "There is no Information for that Customer!",
        status: "error",
      });
    }
  }, [error, documents.length, loading, notificationCtx]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [customerId, error, firebaseAppState, notificationCtx, router]);

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="w-full m-auto flex-col my-6" style={{ marginTop: "50px" }}>
      <GridContainer container spacing={3}>
        <mui.Grid xs={12} sm={12} md={12} lg={10}>
          <PDFLoaderv2 />
        </mui.Grid>
      </GridContainer>
    </div>
  );
}

export default MyDocuments;
