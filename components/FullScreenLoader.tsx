import React from "react";
import { IonLoading } from "@ionic/react";

const FullScreenLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <IonLoading
      isOpen={isLoading}
      message={"Submitting to server..."} 
      spinner="lines"
      cssClass="fullscreen-loader"
    />
  );
};

export default FullScreenLoader;
