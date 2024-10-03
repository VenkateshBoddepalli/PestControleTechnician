import React from "react";
import { IonAlert } from "@ionic/react";
// import './globe.css' 

interface CustomAlertProps {
  isOpen: boolean;
  // title: string;
  subHeader: string;
  message: string;
  buttons: any[];
  onClose: () => void;
  onMessageClick: () => void; // Define the prop for message click
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  // title,
  subHeader,
  message,
  buttons,
  onClose,
  onMessageClick, // Include the prop
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      // header={title}
      subHeader={subHeader}
      message={message}
      buttons={buttons}
      onDidDismiss={onClose}
      // Call onMessageClick when message is clicked

      cssClass="custom-alert custom-alert-size"
      onDidPresent={() => {
        const messageElement = document.querySelector(".alert-message");
        if (messageElement) {
          messageElement.addEventListener("click", onMessageClick);
        }
      }}
      // Cleanup event listener when alert is dismissed
      onWillDismiss={() => {
        const messageElement = document.querySelector(".alert-message");
        if (messageElement) {
          messageElement.removeEventListener("click", onMessageClick);
        }
      }}
    />
  );
};

export default CustomAlert;