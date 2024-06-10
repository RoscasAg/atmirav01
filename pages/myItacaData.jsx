//Example usinf Firebase Realtime Database
import * as React from "react";
import * as mui from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { db2 } from "../store/firebase";
import { Card, CardMedia, CardContent, Grid, Typography } from "@mui/material";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import { styled } from "@mui/material/styles";
import "react-resizable/css/styles.css";
import MuiAlert from "@mui/material/Alert";
import { useRouter } from "next/router";
import Loading from "./components/Loading";
import PDFLoaderv2 from "../store/PDFLoader";
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

function MyItacaData({}) {
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

  const pdfLoaderStyle = {
    width: "40%", // Set the PDFLoader width to 40% of the screen
    float: "right", // Float to the right side
  };

  return (
    <div
      className="w-full m-auto flex-col my-6"
      style={{ marginTop: "50px", width: "90vw" }}
    >
      {error != "" || (documents.length === 0 && !loading) ? (
        <div>Error no documents found</div>
      ) : (
        <GridContainer container spacing={3}>
          {documents.map((document) => (
            <React.Fragment key={document.id}>
              {/* Display Claims */}
              {showInfo === "claims" || showInfo === "all"
                ? document.claims.map((claim) => (
                    <mui.Grid key={claim.id} xs={12} sm={6} md={6} lg={4}>
                      <Card>
                        <CardHeader
                          avatar={
                            <Avatar
                              sx={{ bgcolor: red[500] }}
                              aria-label="claim"
                            >
                              <CarCrashIcon />
                            </Avatar>
                          }
                          action={
                            <IconButton aria-label="settings" size="large">
                              <MoreVertIcon />
                            </IconButton>
                          }
                          title={"Claim ID: " + claim.id}
                          subheader={claim.data}
                          titleTypographyProps={{
                            sx: { fontSize: "1.2rem" },
                          }}
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
                          <IconButton
                            aria-label="add to favorites"
                            size="large"
                          >
                            <FavoriteIcon />
                          </IconButton>
                          <IconButton aria-label="share" size="large">
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
                            <Typography paragraph>
                              Extended Information:
                            </Typography>
                            <Typography paragraph>
                              Informarion about Policies.
                            </Typography>
                            <Typography paragraph>
                              Informarion about Invoices.
                            </Typography>
                            <Typography paragraph>
                              Informarion about Claims.
                            </Typography>
                            <Typography>Additional Information.</Typography>
                          </CardContent>
                        </Collapse>
                      </Card>
                    </mui.Grid>
                  ))
                : null}
              {/* Display Policies */}
              {showInfo === "policies" || showInfo === "all" ? (
                <mui.Grid xs={12} sm={6} md={8} lg={5}>
                  {document.policies.map((policy) => (
                    <Card key={policy.id}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: red[500] }} aria-label="claim">
                            <PictureAsPdfIcon />
                          </Avatar>
                        }
                        action={
                          <IconButton aria-label="settings" size="large">
                            <MoreVertIcon />
                          </IconButton>
                        }
                        title={"Policy ID: " + policy.id}
                        titleTypographyProps={{
                          sx: { fontSize: "1.2rem" },
                        }}
                      />
                      <CardContent>
                        <p>Data: {policy.data}</p>
                        <p>Description: {policy.description}</p>
                        <embed
                          src={policy.pdf}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </mui.Grid>
              ) : null}
              {showInfo !== "claims" && (
                <mui.Grid xs={12} sm={6} md={12} lg={7}>
                  <PDFLoaderv2 />
                </mui.Grid>
              )}
            </React.Fragment>
          ))}
        </GridContainer>
      )}
    </div>
  );
}

export default MyItacaData;
