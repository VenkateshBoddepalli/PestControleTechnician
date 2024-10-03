import React from "react";
import { IonLoading } from "@ionic/react";

const FullScreenLoaderTask: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <IonLoading
      isOpen={isLoading}
      message={"Loading..."} 
      spinner="lines"
      cssClass="fullscreen-loader"
    />
  );
};

export default FullScreenLoaderTask;
