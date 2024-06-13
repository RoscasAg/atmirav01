import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "./layout";
import { UserContextProvider } from "../store/Contextinfo";
import { AppNotificationContextProvider } from "../store/notification-context";
import "@copilotkit/react-ui/styles.css";
import "@copilotkit/react-textarea/styles.css";
import { CopilotKit, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar, CopilotPopup } from "@copilotkit/react-ui";
import Navbar from "./Navbar";
import InfoContext from "../store/Contextinfo";
import { useState, useEffect, useContext } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const { nif } = useContext(InfoContext); // Retrieve NIF from context
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    // Dynamically set the initial message including the NIF when it is available
    setInitialMessage(
      `Hi you ${nif}! 👋 I can help you search for information about your insurance.`,
    );
  }, [nif]); // Dependency array to update message only when nif changes

  /*const myAppState = {
    userName: "Daniel Perales",
    userNIF: nif,
    userAddress: {
      street: "Carretera de Sentmenat, 136",
      city: "Castellar del valles",
      province: "Barcelona",
      country: "Spain",
      cp: "08211",
    }
  };  
  useCopilotReadable({
    description: "The current state of the app",
    value: myAppState
  });

  seCopilotReadable({
    description: "NIF",
    value: nif
  })*/

  return (
    <AppNotificationContextProvider>
      <UserContextProvider>
        <CopilotKit
          runtimeUrl="./api/copilot"
          // Alternatively, you can use runtimeUrl to host your own CopilotKit Runtime
          // runtimeUrl="/api/copilotkit"
        >
          <CopilotPopup
            instructions={
              "Help the user search information about their insurance products."
            }
            defaultOpen={false}
            labels={{
              title: "atmira Copilot",
              initial: initialMessage,
            }}
            clickOutsideToClose={false}
          >
            <RootLayout>
              <Navbar />
              <Component {...pageProps} />
            </RootLayout>
          </CopilotPopup>
        </CopilotKit>
      </UserContextProvider>
    </AppNotificationContextProvider>
  );
}
