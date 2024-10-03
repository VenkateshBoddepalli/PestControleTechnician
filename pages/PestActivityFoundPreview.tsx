import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonItem,
    IonList,
    IonPage,
    IonRow,
    IonText,
    IonLabel,
    IonTitle,
    IonInput,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonImg,
    IonCard,
  } from "@ionic/react";
  import { add } from 'ionicons/icons';
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { useState ,useEffect} from "react";

const PestActivityFound:React.FC = () => {
    const history = useHistory();
    const goBack = () => {history.goBack();};
    const [pestFoundData, setPestFoundData] = useState<any[]>([]);

    useEffect(() => {
      const fetchDataFromStorage = (key: any) => {
        const storedData = sessionStorage.getItem(key);
        if (storedData) {
          return JSON.parse(storedData);
        } else {
          const localStorageData = localStorage.getItem(key);
          if (localStorageData) {
            return JSON.parse(localStorageData);
          }
          return null;
        }
      };
      setPestFoundData(fetchDataFromStorage("pestFormData") || []);

    }, []);
  return (
    <>
      {/* <CommonHeader backToPath={"/"} pageTitle={"Pest Activity Found"} showIcons={false} /> */}

      <IonHeader translate="yes" className="ion-no-border ion-padding-horizontal">
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
          <IonBackButton defaultHref="/PestActivityFound"></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start">Pest Activity Found Preview</IonTitle>          
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentColor previewWrpp">
  <div className="ion-padding-horizontal ion-padding-vertical ionPaddingBottom">
   
        {pestFoundData?.map((data: any, index: any) => (
          <IonCard className="ion-padding-horizontal" key={index}>
            <IonText className="previewHeading">
              <h2>Pest Activity Found Details</h2>
            </IonText>

            <div className="preCont" key={index}>
              <div className="bottomLine">
                <IonText>
                  <h6>Pest Activity Found</h6>
                </IonText>
                <IonText>
                  <h2>{data?.pest_report_type}</h2>
                </IonText>

                <IonText>
                  <h6>Activity Level</h6>
                </IonText>
                <IonText>
                  <h4>{data?.pest_severity}</h4>
                </IonText>

                <IonText>
                  <h6>Area</h6>
                </IonText>
                <IonText>
                  <h4>{data?.pest_area}</h4>
                </IonText>
              </div>
              <IonText>
                <h6>Photo of Pest Found</h6>
              </IonText>
              <div>
                {Array.isArray(data?.pest_photo) ? (
                  data.pest_photo.map((photo: string, photoIndex: number) => (
                    <IonImg key={photoIndex} src={photo} />
                  ))
                ) : (
                  <IonImg src={data?.pest_photo ? data.pest_photo : "path"} />
                )}
              </div>
            </div>
          </IonCard>
        ))}
    
  </div>
</IonContent>


     
    </>
  );
}

export default PestActivityFound;