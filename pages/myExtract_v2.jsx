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
import PDFLoaderv3 from "../store/PDFLoaderExtractInfo";
import AppNotificationContext from "../store/notification-context";
import InfoContext from "../store/Contextinfo";
import { Grid, Box } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import Policiesgrid from "./components/Policiesgrid";
import Invoicesgrid from "./components/Invoicesgrid";
import Claimsgrid from "./components/Claimsgrid";
import { db2 } from "../store/firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import { Card, CardMedia, CardContent, Typography } from "@mui/material"; // Added imports for displaying PDFs
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalSeeIcon from "@mui/icons-material/LocalSee";
import { MendableFloatingButton } from "@mendable/search";
import { MendableSearchBar } from "@mendable/search";
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";

const style = { darkMode: false, accentColor: "#123456" };

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
  const [tabvalue, setTabvalue] = React.useState(0);
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
    firebaseAppState,
  } = useContext(InfoContext);
  const [rows_pol, setRowsPol] = useState([]);
  const [acc_pol, setAccPol] = useState([]);

  // Destructure the query parameters from router
  const { customerId = "Z00000300", showInfo = "all" } = router.query;

  const handleTabChange = (event, newValue) => {
    setTabvalue(newValue);
  };

  const employeeContextId = useCopilotReadable({
    description: "NIF",
    value: nif,
  });
  
  // Function to render PDFs based on the active tab
  const renderPDFsForActiveTab = () => {
    if (tabvalue === 3) {
      // For Policies tab
      return documents.map((doc) =>
        doc.policies.map((policy) => (
          <Card key={policy.id}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {policy.name}
              </Typography>
              <embed
                src={policy.pdf}
                type="application/pdf"
                width="90%"
                height="650px"
              />
            </CardContent>
          </Card>
        )),
      );
    } else if (tabvalue === 4) {
      // For Claims tab
      return documents.map((doc) =>
        doc.claims.map((claim) => (
          <Grid key={claim.id} item xs={12} sm={6} md={6} lg={6}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="claim">
                    <CarCrashIcon />
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={`Claim ID: ${claim.id}`}
                subheader={claim.data}
                titleTypographyProps={{ sx: { fontSize: "1.2rem" } }}
              />
              <CardMedia
                component="img"
                height="200"
                image={claim.photo}
                alt={`Claim ${claim.id} Image`}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {claim.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share">
                  <ShareIcon />
                </IconButton>
                <ExpandMore
                  expand={expanded}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography paragraph>Extended Information:</Typography>
                  <Typography paragraph>Information about Policies.</Typography>
                  <Typography paragraph>Information about Invoices.</Typography>
                  <Typography paragraph>Information about Claims.</Typography>
                  <Typography>Additional Information.</Typography>
                </CardContent>
              </Collapse>
            </Card>
            <br></br>
          </Grid>
        )),
      );
    }
    // You can add more else if conditions for other tab values if needed
  };

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

  useEffect(() => {
    if (!firebaseAppState) {
      router.push("/");
      return;
    }

    const docsRef = ref(db2, `documents/${customerId}`);

    const fetchDocuments = onValue(
      docsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const dataArray = {
            id: customerId,
            claims: Object.entries(data.claims || {}).map(
              ([claimId, claimValue]) => ({
                id: claimId,
                ...claimValue,
              }),
            ),
            policies: Object.entries(data.policies || {}).map(
              ([policyId, policyValue]) => ({
                id: policyId,
                ...policyValue,
              }),
            ),
          };
          setDocuments([dataArray]);
          setLoading(false);
        } else {
          setDocuments([]);
          setOpen(true);
          setLoading(false);
        }
      },
      (errorObject) => {
        setError(errorObject.message);
        setLoading(false);
        notificationCtx.showNotification({
          title: "Error!",
          message: error,
          status: "error",
        });
      },
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      fetchDocuments();
    };
  }, [customerId, error, firebaseAppState, notificationCtx, router]);

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div
      className="w-full m-auto flex-col my-6"
      style={{ width: "90vw", height: "80vh" }}
    >
      {error !== "" || (documents.length === 0 && !loading) ? (
        <div>Error: no documents found</div>
      ) : (
        <>
          <mui.Grid
            container
            spacing={3}
            style={{ marginTop: "20px", marginRight: "20px" }}
          >
            <mui.Grid item xs={3} sm={3} md={8} lg={9}></mui.Grid>
            <mui.Grid item xs={3} sm={3} md={3} lg={3}>
              <MendableSearchBar
                anon_key={process.env.NEXT_PUBLIC_ANON_KEY}
                style={style}
              />
              <br></br>
            </mui.Grid>
          </mui.Grid>
          <mui.Grid container spacing={3}>
            <mui.Grid item xs={12} sm={12} md={6} lg={6} height={400}>
              <Tabs
                value={tabvalue}
                onChange={handleTabChange}
                aria-label="icon label tabs example"
              >
                <Tab icon={<ContentCopyIcon />} label="POLICIES" />
                <Tab icon={<ReceiptIcon />} label="INVOICES" />
                <Tab icon={<CarCrashIcon />} label="CLAIMS" />
                <Tab icon={<PictureAsPdfIcon />} label="DOCUMENTS" />
                <Tab icon={<LocalSeeIcon />} label="PHOTO CLAIMS" />
              </Tabs>
              {tabvalue === 0 ? <Policiesgrid parnifasegurado={nif} /> : null}
              {tabvalue === 1 ? <Invoicesgrid parnifasegurado={nif} /> : null}
              {tabvalue === 2 ? <Claimsgrid parnifasegurado={nif} /> : null}
              {(tabvalue === 3 || tabvalue === 4) && (
                <mui.Grid>{renderPDFsForActiveTab()}</mui.Grid>
              )}
            </mui.Grid>
            <mui.Grid item xs={0.2} sm={0.2} md={0.2} lg={0.2} />
            <mui.Grid item xs={12} sm={12} md={12} lg={5.8}>
              <PDFLoaderv3 />
            </mui.Grid>
          </mui.Grid>
        </>
      )}
    </div>
  );
}

export default MyDocuments;
