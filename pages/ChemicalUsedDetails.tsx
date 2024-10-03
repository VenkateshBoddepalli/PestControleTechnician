import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonPage,
  IonSearchbar,
  IonButton,
  IonItem,
  IonCheckbox,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonList,
  IonText,
  IonProgressBar, // Import IonProgressBar
  // Import IonProgressBar
} from "@ionic/react";
import { useHistory } from "react-router";
import { fetchGetPestChemicalItems } from "../data/apidata/taskApi/taskDataApi";
import {
  retriveChemicalUsedBasedOnNetwork,
  retrieveChemicalUsedfromDB,
} from "../data/offline/entity/DataRetriever";
import { Network } from "@capacitor/network";
import { retrievePestActivityBasedOnNetwork } from "../data/offline/entity/DataRetriever";
import { toast, ToastContainer } from "react-toastify";
interface ChemicalItem {
  id: string;
  item_name: string;
  available_qty: string;
  [key: string]: any;
}

// Define a type for the pest option
interface PestOption {
  id: string;
  item_name: string;
  available_qty: string;
  packaging_uom: string;
}

const ChemicalUsedDetails: React.FC = () => {
  const history = useHistory();
  const [pestOptions, setPestOptions] = useState<PestOption[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<PestOption[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState("");
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator
  const [isChemicalnotFound ,setChemicalnotFound ]=useState<boolean>(false)
  useEffect(() => {
    fetchPestOptions();
  }, []);

  const fetchPestOptions = async () => {
 
    try {
      setLoading(true); // Start loading indicator
      const networkStatus = await Network.getStatus();
      // setIsOnline(networkStatus.connected);

      if (networkStatus.connected) {
        // Online: Fetch data from API
        const { response, data } = await retriveChemicalUsedBasedOnNetwork();
        if (response && response.ok) {
          setPestOptions(data.data);
        } else {
          console.error(data.message);
          // toast.error(data.message);
          setChemicalnotFound(true)
        }
      } else {
        // Offline: Fetch data from local storage or handle offline scenario
        const localData = await retrieveChemicalUsedfromDB();
        setPestOptions(localData);
      }
    } catch (error) {
      console.error("Error fetching pest options:", error);
      toast.error("Server not responding. Please try again later.");
    } finally {
      setLoading(false);
      setChemicalnotFound(false) // Stop loading indicator regardless of success or failure
    }
  };

  const handleCheckboxChange = (option: PestOption) => {
    const isSelected = selectedItems.some((item) => item.id === option.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((item) => item.id !== option.id));
    } else {
      setSelectedItems([...selectedItems, option]);
    }
  };

  // ==================getting option(yes,no) to localstorage===============
  useEffect(() => {
    const selectOpt = localStorage.getItem("selectedOptions");
    if (selectOpt) {
      setSelectedOptions(JSON.parse(selectOpt) || []);
    }
  }, []);
  console.log(selectedOptions);
  const handleSubmit = () => {
    // ==================setting option(yes,no) to localstorage===============

    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    //
    const selectedPestActIndForChem = localStorage.getItem(
      "selectedPestActIndForChem"
    );

    if (!selectedPestActIndForChem) {
      console.error("No selected pest activity index found.");
      return;
    }

    if (selectedItems.length > 0) {
      // Retrieve the existing selected items from localStorage based on the key
      const storedItems = localStorage.getItem(
        `selectedChemicalItems_${selectedPestActIndForChem}`
      );
      let selectedChemicalItems: ChemicalItem[] = storedItems
        ? JSON.parse(storedItems)
        : [];

      // Append the new selected items to the existing ones
      selectedChemicalItems = selectedChemicalItems.concat(
        selectedItems as ChemicalItem[]
      );

      // Remove duplicate items based on item.id
      const uniqueItemsMap = new Map<string, ChemicalItem>();
      selectedChemicalItems.forEach((item: ChemicalItem) => {
        uniqueItemsMap.set(item.id, item);
      });
      const uniqueSelectedChemicalItems = Array.from(uniqueItemsMap.values());

      // Save the updated array back to localStorage with the correct key
      localStorage.setItem(
        `selectedChemicalItems_${selectedPestActIndForChem}`,
        JSON.stringify(uniqueSelectedChemicalItems)
      );

      // Navigate to the chemical used page with the updated state
      history.push({
        pathname: "/chemicalused",
        state: { selectedItems: uniqueSelectedChemicalItems },
      });
    } else {
      alert("Please select at least one chemical.");
    }
  };

  const handleSearch = (ev: CustomEvent) => {
    setSearchText((ev.target as HTMLIonSearchbarElement).value || "");
  };

  const filteredPestOptions = pestOptions.filter((option) =>
    option.item_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCancel = () => {
    history.push("/chemicalused");
  };

  return (
    <IonPage>
      <ToastContainer />
      <IonContent
        fullscreen
        className="ionContentColor ion-padding-vertical ion-padding-horizontal"
      >
        <IonSearchbar
          placeholder="Search By Chemicals / Materials"
          value={searchText}
          debounce={500}
          onIonInput={handleSearch}
          onIonChange={(e) => setSearchText(e.detail.value || "")} // Ensure that empty string is set when no value
        />

        {loading &&   // Render loading indicator if loading is true
          <IonProgressBar type="indeterminate" color="primary" />}
          {filteredPestOptions.length === 0 ? (
        
        !isChemicalnotFound && <p style={{ textAlign: "center", width: "100%" }}>
          No Chemicals Available
            </p>
          
        ) : (

          
          <div className="ion-padding-vertical ionPaddingBottom">
            <h1 className="headingH1 ion-padding-top">
              GENERAL PEST CONTROL (GPC)
            </h1>
            <IonList lines="full" class="ion-list-item listItemAll">
              {filteredPestOptions.map((option) => (
                <IonItem key={option.id}>
                  <IonText className="listCont">
                    <h3>{option.item_name}</h3>

                    <p>
                      Quantity: {option.available_qty} -{" "}
                      {option.packaging_uom || "No Units"}
                    </p>
                  </IonText>
                  <IonCheckbox
                    class="listContRight"
                    checked={selectedItems.some(
                      (item) => item.id === option.id
                    )}
                    onIonChange={() => handleCheckboxChange(option)}
                  />
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>
      <IonFooter className="ion-footer">
        <IonToolbar className="ionFooterTwoButtons">
          <IonButton
            className="ion-button"
            fill="outline"
            color="medium"
            onClick={handleCancel}
          >
            Cancel
          </IonButton>
          <IonButton
            className="ion-button"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
          >
            Submit
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ChemicalUsedDetails;
