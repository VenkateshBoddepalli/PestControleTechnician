import {
  IonBackButton,
  IonSearchbar,
  IonCheckbox,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonProgressBar,
} from "@ionic/react";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import { fetchIdealTechnicians } from "../data/apidata/technicianData/idealTechnicianData";
import { retrieveAvailableTechincianBasedOnNetwork } from "../data/offline/entity/DataRetriever";
import { toast } from "react-toastify";
interface Technician {
  id: number;
  first_name: string;
  last_name: string;
  mobile_no: string;
  avatar?: string;
  isSelected: boolean;
  // other properties if any
}

interface TechnicianResponse {
  data: Technician[];
}

const AvailableTechnicians: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [idealTechnicians, setIdealTechnicians] = useState<any[]>([]);
  const [selectedTechnicianData, setSelectedTechnicianData] = useState<any[]>(
    []
  );
  const [selectedTechnicianDataLoc, setSelectedTechnicianDataLoc] = useState();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredTechnicians, setFilteredTechnicians] = useState<any[]>([]);
  const [noTechician,setNoTechincian]=useState(false)
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };
  /////////////////////Fetch Ideal Technician Data /////////////
useEffect(()=>{
  const timer = setTimeout(() => {
    setNoTechincian(true);
  }, 3000);

  // Cleanup function to clear the timeout if the component unmounts
  return () => clearTimeout(timer);
},[])
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading
      try {
        const data = await retrieveAvailableTechincianBasedOnNetwork();
        const responseData = data; // Assume data is already in the correct format
        console.log("Fetched data:", responseData);
        setIdealTechnicians(responseData.data || responseData); // Ensure data is in correct format
      } catch (error) {
        console.error("Error fetching ideal technicians:", error);
        toast.error("Server not responding. Please try again later.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filterTechnicians = () => {
      if (searchQuery) {
        const filtered = idealTechnicians.filter(
          (technician) =>
            technician.first_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            technician.last_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setFilteredTechnicians(filtered);
      } else {
        setFilteredTechnicians(idealTechnicians);
      }
    };
    filterTechnicians();
  }, [searchQuery, idealTechnicians]);
  //////////////Is selected////////////////
  const isSelected = (technician: any) => {
    return selectedTechnicianData.some((t) => t.id === technician.id);
  };

  const handleCheckboxChange = (technician: any) => {
    const updatedTechnicians = [...idealTechnicians];
    const index = updatedTechnicians.findIndex(
      (t) => t.user_id === technician.user_id
    );
    updatedTechnicians[index].isSelected =
      !updatedTechnicians[index].isSelected;
    const selectedTechnicians = updatedTechnicians.filter(
      (tech) => tech.isSelected
    );
    setSelectedTechnicianData(selectedTechnicians);
    setIdealTechnicians(updatedTechnicians);
  };

  useEffect(() => {
    const selectOpt = localStorage.getItem("selectedTechnicianData");
    if (selectOpt) {
      setSelectedTechnicianDataLoc(JSON.parse(selectOpt) || []);
    }
  }, []);

  console.log(selectedTechnicianDataLoc);
  const handleUpdateTechnicians = () => {
    const storedData = localStorage.getItem("selectedTechnicianDataLocal");
    const previouslySelectedTechnicians = storedData
      ? JSON.parse(storedData)
      : [];

    // Combine previously selected technicians with newly selected ones
    const combinedTechnicians = [
      ...previouslySelectedTechnicians,
      ...selectedTechnicianData,
    ];

    // Remove duplicates based on mobile number
    const uniqueTechnicians = Array.from(
      new Map(
        combinedTechnicians.map((item) => [item.mobile_no, item])
      ).values()
    );

    // Store updated data in localStorage
    localStorage.setItem(
      "selectedTechnicianDataLocal",
      JSON.stringify(uniqueTechnicians)
    );

    // Update the number of technicians required based on the selected technicians
    const techniciansRequired = uniqueTechnicians.length;
    localStorage.setItem(
      "techniciansRequired",
      JSON.stringify(techniciansRequired)
    );

    console.log("Handle Update Technicians", selectedTechnicianData);

    // Pass selected technicians to TeamAttendance page
    history.push({
      pathname: `/TeamAttendance/${techniciansRequired}`,
      state: { selectedTechnicianData: uniqueTechnicians },
    });
  };
  const handleInput = (ev: CustomEvent) => {
    const query = (ev.target as HTMLIonSearchbarElement).value!.toLowerCase();
    setSearchQuery(query);
  };

  return (
    <>
      <CommonHeader
        backToPath={"/teamattendance/:techniciansRequired"}
        pageTitle={"Available Technicians"}
        showIcons={false}
      />
    {!noTechician && <IonProgressBar type="indeterminate" />}  
      {filteredTechnicians.length === 0 ? (
        
        noTechician && <p style={{ textAlign: "center", width: "100%" }}>
      No Technicians Available
        </p>
      ) : (
        <IonContent
          fullscreen
          className="ionContentColor ion-padding-vertical ion-padding-horizontal"
        >
          {isLoading && <IonProgressBar type="indeterminate" />}
          <IonSearchbar
            debounce={1000}
            onIonInput={(ev) => handleInput(ev)}
          ></IonSearchbar>

          <div className="ion-padding-vertical serviceRequestStatus ionPaddingBottom">
            <IonList lines="full" className="ion-list-item listItemAll">
              {filteredTechnicians.map((technician, index) => (
                <IonItem key={index}>
                  <IonThumbnail slot="start" className="thumbnailIcon">
                    <IonImg
                      src={
                        technician.avatar || "assets/images/technician-icon.svg"
                      }
                    />
                  </IonThumbnail>
                  <IonText className="listCont">
                    <h3>
                      {technician.first_name} {technician.last_name}
                    </h3>
                    <h2>{technician.mobile_no}</h2>
                  </IonText>
                  <IonCheckbox
                    checked={technician.isSelected}
                    onIonChange={() => handleCheckboxChange(technician)}
                    className="listContRight"
                  />
                </IonItem>
              ))}
            </IonList>
          </div>
        </IonContent>
      )}

      <IonFooter className="ion-footer">
        <IonToolbar>
          <IonButton
            // routerLink="/TeamAttendance"
            className="ion-button ion-margin-horizontal"
            expand="block"
            color={"primary"}
            onClick={handleUpdateTechnicians}
          >
            Update Technicians
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
export default AvailableTechnicians;
