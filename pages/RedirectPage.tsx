import {
  Redirect,
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import { useHistory } from "react-router-dom";

import { IonApp, IonPage, IonRouterOutlet, setupIonicReact } from "@ionic/react";

import { useEffect, useState } from "react";

const RedirectPage: React.FC = () => {
  const history = useHistory();

  const checkIfLoggedIn = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const parsedData = JSON.parse(userDataString);
      return true;
    }
    return false;
  };

  useEffect(() => {
    console.log("Chhecking User session")
    const checkInFlag = localStorage.getItem("checkInFlag");

    if (checkIfLoggedIn()) {
      console.log("User session valid")
      if (checkInFlag === "true") {
        console.log("User session valid, checkIn is TRUE .. nav to Dashboard")
        // If user data and check-in flag are found, redirect to dashboard
        history.push("/dashboard")
      } else {
        // If only user data is found, redirect to home page
        console.log("User session valid, but NOT Cheked IN .. nav to HOME")
        history.push("/home")
      }
    } else {
      console.log("User session NOT valid. nav to LOGIN")
      history.push("/login")
    }
  }, []);

  return (
    <IonPage>
    </IonPage>
  );
};

export default RedirectPage;