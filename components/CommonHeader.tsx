import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonImg,
  IonIcon,
  IonBackButton,
  IonText,
  IonBadge,
} from "@ionic/react";
import React from "react";
import { useState, useEffect } from "react";
import CustomBackButton from "./CustomBackButton";
import { useHistory } from "react-router";
import { ellipse } from "ionicons/icons";
import { fetchNotifications } from "../data/apidata/notificationsApi/notificationsApi";
import NotificationLength from "./NotificationLength";
const CommonHeader: React.FC<any> = ({
  backToPath,
  pageTitle,
  showIcons,
  length,
}) => {
  const history = useHistory();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [notification, setNotifications] = useState([]);

  // Set the previous path when navigating from PestActivityFound to TaskPreview
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === "/taskpreview") {
      if (hash === "#pestActivitySection") {
        setPreviousPath("/pestactivityfound");
      } else if (hash === "#chemicalUsedSection") {
        setPreviousPath("/chemicalused");
      }
    }
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    history.push(previousPath || backToPath); // Go back to the previous page or default backToPath
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchNotifications();
        console.log(response);
        setNotifications(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonButton onClick={handleBackClick}>
              <CustomBackButton />
            </IonButton>
            {/* <IonBackButton defaultHref={backToPath}></IonBackButton> */}
            {/* <CustomBackButton onClick={goBack} path={backToPath} /> */}
          </IonButtons>
          <IonTitle className="ion-float-start">{pageTitle}</IonTitle>
          {showIcons ? (
            <div className="ion-float-end headerBts">
              <IonButton shape="round" routerLink={"/"}>
                <IonImg src="assets/images/home-outline-icon.svg" />
              </IonButton>
            
             <NotificationLength/>

              <IonButton shape="round" routerLink={"/profile"}>
                <IonImg src="assets/images/account-user.svg" />
              </IonButton>
             
            </div>
          ) : (
            ""
          )}
        </IonToolbar>
      </IonHeader>
    </>
  );
};

export default CommonHeader;
