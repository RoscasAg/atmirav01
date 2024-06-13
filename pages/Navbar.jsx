import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Link from "next/link";
import InfoContext from "../store/Contextinfo";
import SigninButton from "./components/SigninButton";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Navbar = () => {
  const { nif } = useContext(InfoContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div style={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{ backgroundColor: "#157ba7", color: "#333", width: "100%" }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
          }}
        >
          <Image
            src="/assets/images/itaca_logo.png"
            alt="ITACA logo"
            width={100}
            height={100}
          />
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing(1) }}
          >
            <Link href="/">
              <Button style={{ color: "#fff" }}>Home</Button>
            </Link>
            <Link
              href={{
                pathname: "/myExtract_v2",
                query: { customerId: nif },
              }}
            >
              <Button style={{ color: "#fff" }}>SEARCH</Button>
            </Link>
            <Link href="/myGraph">
              <Button style={{ color: "#fff" }}>Graph</Button>
            </Link>
            <Link href="/myManuals">
              <Button style={{ color: "#fff" }}>SISnet</Button>
            </Link>
            <Link href="/myCVs">
              <Button style={{ color: "#fff" }}>atmira CVs</Button>
            </Link>
            <Link href="/myExtract">
              <Button style={{ color: "#fff" }}>Extract CVs</Button>
            </Link>
            <Link href="/pbiatmiraCV">
              <Button style={{ color: "#fff" }}>PBI CV</Button>
            </Link>
            <Link href="/company">
              <Button style={{ color: "#fff" }}>COMPANY</Button>
            </Link>
            <SigninButton />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};
export default Navbar;
