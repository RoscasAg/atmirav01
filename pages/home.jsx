import { useContext, useState, useEffect } from "react";
import * as mui from "@mui/material";
import { styled } from "@mui/material/styles";
import "react-resizable/css/styles.css";
import InfoContext from "../store/Contextinfo";
import CardCustomer from "./components/CardCustomer";
import Loading from "./components/Loading";
import BarChart from "./components/Chartnum1";
import LineChart from "./components/Chartnum2";
import PieChart from "./components/Chartnum3";
import { useRouter } from "next/router";
import { MendableSearchBar } from "@mendable/search";
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";

const style = { darkMode: false, accentColor: "#123456" };

const GridContainer = styled(mui.Grid)(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
}));

const ChartWrapper = styled(mui.Box)(({ theme }) => ({
  border: "1px solid lightgrey",
  boxShadow: theme.shadows[1],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

export default function Home() {
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useCopilotReadable({
    description: "NIF",
    value: nif
  })

  /*const employeeContextId = useCopilotReadable({
    description: "NIF",
    value: nif
  });
  useCopilotReadable({
    description: "Name",
    value: "Miquel",
    parentId: employeeContextId
  });
  useCopilotReadable({
    description: "Apellido",
    value: "Rivera",
    parentId: employeeContextId
  });*/
  
  useEffect(() => {
    if (!firebaseAppState) {
      router.push("/");
      return;
    }

    // Simulate a delay of 2 seconds to show the loading spinner
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, [firebaseApp, router, firebaseAppState]);

  if (isLoading) {
    return <Loading type="spinningBubbles" color="#157ba7" />;
  }

  return (
    <div className="w-full m-auto flex-col my-6" style={{ width: "90vw" }}>
      <GridContainer container spacing={3} style={{ marginRight: "20px" }}>
        <mui.Grid item xs={3} sm={3} md={9} lg={9}></mui.Grid>
        <mui.Grid item xs={3} sm={3} md={3} lg={3}>
          <MendableSearchBar
            anon_key={process.env.NEXT_PUBLIC_ANON_KEY}
            style={style}
          />
        </mui.Grid>
      </GridContainer>
      <GridContainer container spacing={3}>
        <mui.Grid item xs={12} sm={6} md={4} lg={3}>
          <CardCustomer />
        </mui.Grid>
        <mui.Grid item xs={12} sm={6} md={7} lg={5}>
          <ChartWrapper>
            <BarChart nifaSegur={nif} />
          </ChartWrapper>
          <br />
          <ChartWrapper>
            <LineChart nifaSegur={nif} />
          </ChartWrapper>
        </mui.Grid>
        <mui.Grid item xs={12} sm={6} md={5} lg={4}>
          <ChartWrapper>
            <PieChart nifaSegur={nif} />
          </ChartWrapper>
        </mui.Grid>
      </GridContainer>
    </div>
  );
}
