import React from "react";
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

const MenuAction: React.FC<any> = ({ path, icon, title, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <>
      <IonCol size="4">
        <IonCard routerLink={path} onClick={handleClick}>
          <IonImg src={"assets/images/" + icon} />
          <IonText>{title}</IonText>
        </IonCard>
      </IonCol>
    </>
  );
};

export default MenuAction;
