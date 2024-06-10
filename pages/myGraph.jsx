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
import { Button as MuiButton } from "@mui/material";
import AppNotificationContext from "../store/notification-context";
import InfoContext from "../store/Contextinfo";
import { getDatabase, ref, onValue } from "firebase/database";
import { db2 } from "../store/firebase";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAI } from "@langchain/openai";
import { GraphCypherQAChain } from "langchain/chains/graph_qa/cypher";
import { Box } from "@mui/material";

const url = "neo4j+s://b0c2cfa5.databases.neo4j.io";
const username = "neo4j";
const password = "7dDPbiw9ohk54DCsYxL-hJgotpbwfIfdl-5x3c2425U";

let model;

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

function MyPeopleGraph({}) {
  const router = useRouter();
  const [people, setPeople] = useState([]);
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

  const defaultCertification = {
    title: "none",
    year: "1900",
  };

  const defaultIndustry = {
    industry: "none",
    description: " ",
    yearsOfExperience: 0,
  };

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

  const fetchPeople = () => {
    setLoading(true);

    const peopleRef = ref(db2, "people");
    onValue(
      peopleRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const peopleArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));

          setPeople(peopleArray);
          setLoading(false);
        } else {
          setPeople([]);
          setOpen(true);
          setLoading(false);
        }
      },
      (errorObject) => {
        setError(errorObject.message);
        setLoading(false);
        notificationCtx.showNotification({
          title: "Error!",
          message: errorObject.message,
          status: "error",
        });
      },
    );
  };

  const callPopulateGraphAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/populateGraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ people }),
      });
      if (!response.ok) throw new Error("Failed to call populate graph API");
      const data = await response.json();
      console.log(data.message);
      // Handle success
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(error.toString());
      setLoading(false);
      notificationCtx.showNotification({
        title: "Error!",
        message: error.message,
        status: "error",
      });
    }
  };

  const populateGraph = async () => {
    const graph = await Neo4jGraph.initialize({ url, username, password });
    console.log(process.env["OPENAI_API_KEY"]);
    model = new OpenAI({
      openAIApiKey: "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",
      modelName: process.env["OPENAI_MODEL"],
      temperature: 0,
    });

    const query_create_4 = `
    MERGE (p:Person {employeid: $employeid})
    ON CREATE SET p.name = $name, p.company = $company
    WITH p
    UNWIND $languages AS lang
    MERGE (l:Language {name: lang.name})
    ON CREATE SET l.name = lang.name
    MERGE (p)-[:SPEAKS {level: lang.level}]->(l)
    WITH p
    UNWIND $certifications AS cert
    MERGE (c:Certification {title: cert.title})
    ON CREATE SET c.year = cert.year, c.title = cert.title
    MERGE (p)-[:HAS_CERTIFICATION]->(c)
    WITH p
    UNWIND $professionalExperience AS pe
    MERGE (exp:Experience {position: pe.position, company: pe.company, client: pe.client})
    MERGE (p)-[:HAS_EXPERIENCE]->(exp)
    WITH p
    UNWIND $education AS edu
    MERGE (e:Education {degree: edu.degree, institution: edu.institution})
    ON CREATE SET e.year = edu.year
    MERGE (p)-[:HAS_EDUCATION]->(e)
    WITH p
    UNWIND $skills.technical AS skill
    MERGE (s:Skill {name: skill})
    MERGE (p)-[:HAS_SKILL]->(s)
    WITH p
    UNWIND $industryExperience AS ie
    MERGE (ind:IndustryExperience {industry: ie.industry})
    ON CREATE SET ind.description = ie.description, ind.yearsOfExperience = ie.yearsOfExperience
    MERGE (p)-[:HAS_INDUSTRY_EXPERIENCE]->(ind)
    `;

    for (const person of people) {
      // Preprocess each person's professional experience to ensure `client` field exists
      person.professional_experience = person.professional_experience.map(
        (experience) => {
          if (!experience.client) {
            // Checks both for undefined and empty string
            return { ...experience, client: "Unknown Client" }; // Provides a default value
          }
          return experience;
        },
      );

      try {
        await graph.query(query_create_4, {
          name: person.name,
          employeid: person.employeid,
          company: person.company || "none",
          languages: person.languages,
          certifications:
            person.certifications && person.certifications.length > 0
              ? person.certifications
              : [defaultCertification],
          professionalExperience: person.professional_experience,
          education: person.education,
          skills: person.skills,
          industryExperience:
            person.industry_experience && person.industry_experience.length > 0
              ? person.industry_experience
              : [defaultIndustry],
        });
        console.log(
          `Person ${person.name} and relationships created successfully`,
        );
      } catch (error) {
        console.error(
          `Failed to create person ${person.name} and relationships:`,
          error,
        );
      }
    }

    // Refresh schema
    await graph.refreshSchema();
  };

  useEffect(() => {
    if (error != "" || (people.length === 0 && !loading)) {
      notificationCtx.showNotification({
        title: "Error!",
        message: "There is no Information for that Customer!",
        status: "error",
      });
    }
  }, [error, people.length, loading, notificationCtx]);

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
    <div
      className="w-full m-auto flex-col my-6"
      style={{ marginTop: "50px", width: "90vw" }}
    >
      <GridContainer container spacing={3}>
        <mui.Grid xs={12} sm={12} md={12} lg={12}>
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={() => fetchPeople()}
          >
            Load People Data
          </MuiButton>
          {"  "}
          <MuiButton
            variant="outlined"
            color="primary"
            onClick={() => callPopulateGraphAPI()}
          >
            Build the Graph
          </MuiButton>
        </mui.Grid>
        <Box sx={{ width: "1450px", height: "750px" }}>
          <iframe
            title="Report Section"
            width="100%"
            height="100%"
            src="https://workspace-preview.neo4j.io/workspace/query?ntid=auth0%7C66008d9c14e3ef8d424bf1ad&_ga=2.72660891.985921476.1711783123-2059021814.1710605584"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </Box>
      </GridContainer>
    </div>
  );
}

export default MyPeopleGraph;
