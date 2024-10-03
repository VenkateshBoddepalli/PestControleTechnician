import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import {
  IonBackButton,
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
  IonSearchbar,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonModal,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import {
  fetchMaterilData,
  fetchTechnicians,
  transferStock,
} from "../data/apidata/stockTransferApi/stockTransferApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StockTransfer: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const goBack = () => {
    history.goBack();
  };
  const [isOpen, setIsOpen] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isTechniciansOpen, setIsTechniciansOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [materialDetails, setMaterialDetails] = useState<any>([]);
  const [technicianDetails, setTechnicianDetails] = useState<any[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: any }>( {});
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [transferMaterials, setTransferMaterials] = useState([]);
  const [transferItems, setTransferItems] = useState<any[]>([]);
  const [deleteAlert, setDeleteAlert] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMoreMaterials, setHasMoreMaterials] = useState(true);

  const handleInput = (ev: any) => {
    console.log(ev.detail.value);
    setSearchQuery(ev.detail.value);
    console.log("search", searchQuery);
    setPage(0);
    
    setHasMoreMaterials(true);
    getMaterialList(true);
  };
  useEffect(() => {
    
  }, []);

  useEffect(() => {
    
  }, [transferItems]); // Include transferItems as a dependency here

  useEffect(() => {
    
  }, [inputValues]); // Include transferItems as a dependency here

  const addToTransfer = (item: any) => {
    toast.dismiss();
    const isItemInTransfer = transferItems.find((transferItem: any) => transferItem.id === item.id);
    if (isItemInTransfer) {
      if (Math.round(inputValues[item.id] * 100) == Math.round(0 * 100)) {
        toast.error("Minimum quantity is 1");
        setInputValues({
          ...inputValues,
          [item.id]: parseFloat('1').toFixed(2),
        })
        return;
      }
      if (Math.round(inputValues[item.id] * 100) > Math.round(item.availableQuantity * 100)) {
        toast.error(`Maximum quantity is ${item.availableQuantity}`);
        setTransferItems(
          transferItems.map((transferItem: any) =>
            transferItem.id === item.id
              ? { ...transferItem, quantity: parseFloat(item.availableQuantity).toFixed(2) || parseFloat('0').toFixed(2) }

              : transferItem
          )
        );
        setInputValues({
          ...inputValues,
          [item.id]: item.availableQuantity,
        })
      } else {
        setTransferItems(
          transferItems.map((transferItem: any) =>
            transferItem.id === item.id
              ? { ...transferItem, quantity: parseFloat(inputValues[item.id]).toFixed(2) || parseFloat('0').toFixed(2) }

              : transferItem
          )
        );
        toast.success(`${item.item_name} updated sucessfully`);
      }

    } else {
      if (1 > item.availableQuantity) {

        toast.error(`Maximum quantity is ${item.availableQuantity}`);
      } else {
        setTransferItems([...transferItems, { ...item, quantity: parseFloat('1').toFixed(2) }]);
        setInputValues({
          ...inputValues,
          [item.id]: parseFloat('1').toFixed(2),
        });
        //toast.success(`${item.item_name} added sucessfully`);
      }
    }
    console.log(transferItems);
  };
  const createAlert = (item: any) => {
    const newAlert = {
      isOpen: true,
      header: `Delete ${item.item_name}`,
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');
            removeFromTransfer(item);
          }
        }
      ],
      id: item.id
    };
    setDeleteAlert([...deleteAlert, newAlert]);
  };
  const closeAlert = (id: number) => {
    setDeleteAlert(deleteAlert.map(alert => alert.id === id ? { ...alert, isOpen: false } : alert));
  };
  const removeFromTransfer = (item: any) => {
    setTransferItems(transferItems.filter((transferItem: any) => transferItem.id !== item.id));
  };
  const handleRemoveFromTransfer = (product: any) => {
    removeFromTransfer(product);
  };
  const handleAddButtonClick = (item: any) => {
    const newItem = {
      id: item.id,
      item_name: item.item_name,
      availableQuantity: item.availableQuantity,
      selectedQuantity: inputValues[item.id] || 0,
    };

    setSelectedMaterials((prevSelectedMaterials) => {
      const existingItemIndex = prevSelectedMaterials.findIndex(
        (material) => material.id === item.id
      );

      if (existingItemIndex !== -1) {
        const updatedMaterials = [...prevSelectedMaterials];
        updatedMaterials[existingItemIndex] = newItem;
        return updatedMaterials;
      }

      return [...prevSelectedMaterials, newItem];
    });
    toast.success("Material Added Successfully");
  };

  const handleDeleteButtonClick = (itemId: string) => {
    setSelectedMaterials((prevSelectedMaterials) =>
      prevSelectedMaterials.filter((item) => item.id !== itemId)
    );

    setInputValues((prevInputValues) => {
      const updatedInputValues = { ...prevInputValues };
      delete updatedInputValues[itemId];
      return updatedInputValues;
    });
  };

  useEffect(() => {
    console.log("Selected Materials Updated:", selectedMaterials);
  }, [selectedMaterials]);

  useEffect(() => {
    console.log("Selected Input Value", inputValues);
  }, [inputValues]);

  useEffect(() => {
    console.log("transfer materials", transferMaterials);
  }, [transferMaterials]);

  useEffect(() => {
    
    getMaterialList(true);
  }, [searchQuery]);

  const getMaterialList = async (isInitial: boolean = false) => {
    setLoading(true);
    try {
      const payload = {
        columns: [
          "tbl_items.id",
          "tbl_items.item_name",
          "tbl_uoms.name as unitName",
          "tbl_employee_stock_book.quantity as availableQuantity",
          "tbl_items.packaging_uom"
        ],
        order_by: {
          "tbl_items.created_on": "asc"
        },
        filters: {
          "tbl_items.item_name": searchQuery
        },
        pagination: {
          limit: "10",
          page: isInitial ? "0" : page.toString()
        }
      };
      const response = await fetchMaterilData(payload);
      console.log(response);
      if (response && response.success) {
        const details = response.data;
        if (isInitial) {
          setMaterialDetails(details);
        } else {
          setMaterialDetails((prevDetails: any) => [...prevDetails, ...details]);
        }
        setHasMoreMaterials(details.length === 10);
        setPage(prevPage => prevPage + 1);
      } else {
        console.error("Failed to fetch material details. Error:", response?.data.message);
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error fetching material details:", error);
      toast.error('Server not responding. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMaterials = async (event: CustomEvent<void>) => {
    
    await getMaterialList();
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };
  useEffect(() => {
    getTechniciansList();
    setSelectedTechnician("");
  }, []);

  const getTechniciansList = async () => {
    setLoading(true); // Start loading
    fetchTechnicians()
      .then((response) => {
        if (response && response.success) {
          console.log(response.data);
          const technicianData = response.data;
          setTechnicianDetails(technicianData);
          console.log(technicianDetails);
        } else {
          console.error(
            "Failed to fetch technnician data. Error:",
            response.message
          );
          // toast.error('Server not responding. Please try again later.');
        }
      })
      .catch((error) => {
        console.error("Error fetching technician data:", error);
        toast.error('Server not responding. Please try again later.');
      })
      .finally(() => {
        setLoading(false); //end loading
      });
  };

  const handleInputChange = (e: CustomEvent, id: string) => {
    // Get the input value from the event
    let inputValue = e.detail.value;
  
    // Use a regular expression to allow only numbers and a single decimal point
    inputValue = inputValue.replace(/[^0-9.]/g, '');
  
    // Split the value on the decimal to handle cases with multiple decimals
    const parts = inputValue.split('.');
    
    if (parts.length > 2) {
      // If more than one decimal point exists, reconstruct the value
      inputValue = parts.shift() + '.' + parts.join('');
    }
  
    // Update the inputValues state with the sanitized input
    setInputValues((prevValues) => ({
      ...prevValues,
      [id]: inputValue,
    }));
  };
  

  const onKeyDown = (event: any, quantity: any) => {
    const allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Tab",
    ];
    const inputRegex = /^[0-9]$/;
    const inputValue = event.key;

    if (!allowedKeys.includes(event.key) && !inputRegex.test(event.key)) {
      event.preventDefault();
    }

    const currentInput = (event.target as HTMLInputElement).value + inputValue;
    const numericValue = Number(currentInput);

    if (
      !allowedKeys.includes(event.key) &&
      (isNaN(numericValue) || numericValue < 0 || numericValue > quantity)
    ) {
      event.preventDefault();
      toast.error("Insufficient Quantity");
    }
  };

  const handleNext = () => {
    const mappedMaterials: any = transferItems.map((material: any) => ({
      item_id: material.id,
      item_quantity: material.quantity,
    }));

    setTransferMaterials(mappedMaterials);
    setIsTechniciansOpen(true);
  };

  const handleTechnicians = (event: any) => {
    console.log(event.detail.value);
    setSelectedTechnician(event.detail.value);
  };

  const handleCancel = () => {
    setIsTechniciansOpen(false);
    setSelectedTechnician("");
  };

  const handleOk = () => {
    setIsTechniciansOpen(false);
  };

  const handleTechnicianSearch = (event: CustomEvent) => {
    const searchText = event.detail.value?.toLowerCase() || "";
    if (searchText) {
      const filteredTechnicians = technicianDetails.filter(
        (technician) =>
          `${technician.first_name.toLowerCase()} ${technician.last_name.toLowerCase()}`.includes(searchText) ||
          technician.mobile_no.includes(searchText)
      );
      setTechnicianDetails(filteredTechnicians);
    } else {
      getTechniciansList(); // Reset to full list if search text is empty
    }
  };

  const handleTransfer = async () => {
    setLoading(true); // Start loading
    transferStock(selectedTechnician, transferMaterials)
      .then(async (response) => {
        if (response && response.success) {
          console.log(response.message);
          await setInputValues({});
          await setTransferItems([]);
          await setSelectedMaterials([]);
          await setIsTechniciansOpen(false);
          toast.success(response.message);
          setTimeout(() => {
            history.push("./stocktransferredreceived");
          }, 2000)

        } else {
          console.error(
            "Error while transfering the material stocks",
            response.message
          );
          toast.error(response.message);
        }
      })
      .catch((error) => {
        // toast.error(error);
        console.error("Error while transfering the material stocks:", error);
        toast.error('Server not responding. Please try again later.');
      })
      .finally(async () => {
        setLoading(false); //end loading

      });
  };

  const handleAvlInput = (event: CustomEvent, maxQuantity: number) => {
    const input = event.target as HTMLIonInputElement;
    const value = input.value?.toString() || "";

    // const numericValue = value.replace(/[^0-9]/g, '');
    const numValue = parseFloat(value);

    const validateInput = () => {
      if (isNaN(numValue) || numValue < 0) {
        input.value = "";
        toast.error("Invalid quantity");
      } else if (numValue > maxQuantity) {
        input.value = maxQuantity.toString();
        toast.error(`Maximum quantity is ${maxQuantity}`);
      }
    };

    validateInput();
  };

  return (
    <>
    <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start">Stock Transfer</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" routerLink={"/"}>
              <IonImg src="assets/images/home-outline-icon.svg" />
            </IonButton>

            <IonButton shape="round" routerLink={"/stocktransferredreceived"}>
              <IonImg src="assets/images/stock-transfer-header-icon.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className="stockTransferWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <IonItem
          lines="none"
          className="ion-item-inner ion-no-padding ion-margin-top"
        >
          <IonSearchbar
            debounce={500}
            onIonInput={(ev: any) => handleInput(ev)}
          ></IonSearchbar>
        </IonItem>

        <div className="ionPaddingBottom materialCard">
          <>
            {deleteAlert.map(alert => (
              <IonAlert
                key={alert.id}
                isOpen={alert.isOpen}
                onDidDismiss={() => closeAlert(alert.id)}
                header={alert.header}
                subHeader={alert.subHeader}
                message={alert.message}
                buttons={alert.buttons}
              />
            ))}
            <IonItem lines="none" className="stockHeadingH1">
              <h1>Material List</h1>
              <IonButton
                id="stockPreviewModal"
                slot="end"
                shape="round"
                className=" ion-float-end"
              >
                <IonImg src="/assets/images/preview-icon.svg"></IonImg>
              </IonButton>
            </IonItem>

            {materialDetails && materialDetails.length > 0 ? (
              materialDetails.map((data: any, index: any) => (
                <IonCard
                  key={index}

                  className="ion-list-item  ion-no-padding stockList"
                >
                  <IonItem key={index} lines="none">
                    <IonText className="listCont">
                      <h3>{data.item_name}</h3>
                      <div className="stockInputAdd">
                        <p className="ion-float-left">
                          Available Qty:{" "}
                          <IonText className="availableQty">
                            {parseFloat(data.availableQuantity)} - {data.packaging_uom}
                          </IonText>
                        </p>


                        {
                          !transferItems.find((item: any) => item.id === data.id) ? (
                            <div className="stockCartButtons flex gap-4">
                              <IonButton
                                className="ion-button ion-float-right"
                                color="primary"
                                onClick={() => addToTransfer(data)}
                              >
                                Add
                              </IonButton>
                            </div>
                          ) : (
                            <div className="stockCartButtons flex gap-4">
                              <IonInput
                                type="number"
                                className="ion-float-left"
                                placeholder=""
                                value={inputValues[data.id] || ""}
                                //value={transferItems.find((item: any) => item.id === data.id).quantity || ""}
                                onIonInput={(e: CustomEvent) => {
                                  handleInputChange(e, data.id);

                                }}

                              ></IonInput>
                              
                              <IonButton
                                className="ion-button"
                                color="primary"
                                onClick={() => addToTransfer(data)}
                              >
                                Update
                              </IonButton>
                              <IonButtons
                                className="ion-float-right"
                                onClick={() => createAlert(data)}>
                                <IonImg src="/assets/images/stock-delete-icon.svg" className="deleteImg"></IonImg>
                              </IonButtons>

                            </div>
                          )
                        }

                      </div>
                    </IonText>
                  </IonItem>
                </IonCard>
              ))
            ) : (
              <IonItem lines="none">
                <div className="searchMaterialPage">
                  {/* <IonImg src="assets/images/search-page-icon.svg"></IonImg> */}
                  <IonText>No Material Found</IonText>
                </div>
              </IonItem>
            )}
          </>
          <IonInfiniteScroll
            threshold="100px"
            onIonInfinite={loadMoreMaterials}
            disabled={!hasMoreMaterials}
          >
            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Loading more materials..."
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </div>

        <IonModal ref={modal} trigger="stockPreviewModal" className="ion-bottom-modal stockMaterialPreviewModal">
          <IonHeader>
            <IonToolbar>
              <IonTitle className="ion-padding-start">
                Selected Material Preview
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <div className="modalInputSandsale">
              <IonList
                lines="inset"
                className="ion-list-item  ion-no-padding stockList"
              >
                {transferItems && transferItems.length > 0 ? (
                  transferItems.map((item: any, index: any) => (
                    <IonItem key={index}>
                      <div className="selectedPreviewWrap listCont ion-padding-top">
                        <IonText className="previewHeading">
                          <h2 className="ion-float-left width80p">{item.item_name}</h2>
                          <IonButtons
                            className="ion-float-right"
                            onClick={() => createAlert(item)}
                          >
                            <IonImg src="/assets/images/stock-delete-icon.svg"></IonImg>
                          </IonButtons>
                        </IonText>

                        <div className="stockInputAdd">
                          <p>
                            Available Qty:{" "}
                            <IonText className="availableQty">
                              {parseFloat(item.availableQuantity)} - {item.packaging_uom}
                            </IonText>
                          </p>
                          <p >
                            Selected Qty:{" "}
                            <IonText className="availableQty">
                              {parseFloat(item.quantity)} - {item.packaging_uom}
                            </IonText>
                          </p>
                        </div>
                      </div>
                    </IonItem>
                  ))) : (
                  <IonItem lines="none">
                    <div className="searchMaterialPage">
                      {/* <IonImg src="assets/images/search-page-icon.svg"></IonImg> */}
                      <IonText>No Material selected</IonText>
                    </div>
                  </IonItem>
                )}
              </IonList>
            </div>
          </IonContent>
          <IonFooter className="ion-footer">
            <IonToolbar>
              <IonButton
                onClick={() => modal.current?.dismiss()}
                className="ion-button ion-margin-horizontal"
                expand="block"
                fill="outline"
                color={"medium"}
              >
                Cancel
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>

        <IonModal onDidDismiss={handleCancel}
          className="ion-modal availableTechnicianModal"
          isOpen={isTechniciansOpen}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle className="ion-padding-start">
                Available Technicians
              </IonTitle>
              <IonSearchbar
                debounce={300}
                onIonInput={(ev) => handleTechnicianSearch(ev)}
              ></IonSearchbar>
            </IonToolbar>

          </IonHeader>

          <IonContent className="ion-padding">
            <div>

              <IonList className="ion-radio-ui">
                <IonRadioGroup
                  value={selectedTechnician}
                  onIonChange={handleTechnicians}
                >
                  {technicianDetails && technicianDetails.length > 0 ? (
                    technicianDetails.map((item, index) => (
                      <IonItem key={index}>
                        <IonRadio
                          value={item.user_id}
                          color="secondary"
                          className="width100"
                          justify="space-between"
                          labelPlacement="start"
                        >
                          <div className="listCont">
                            <IonText className="previewHeading">
                              <h2>
                                {item.first_name} {item.last_name}
                              </h2>
                              <p>{item.mobile_no}</p>
                            </IonText>
                          </div>
                        </IonRadio>
                      </IonItem>
                    ))
                  ) : (
                    <IonItem lines="none">
                      <div className="searchMaterialPage">
                        <IonImg
                          style={{ width: "110px" }}
                          src="../../../assets/images/nodata-technician-img.svg"
                        ></IonImg>
                        <IonText
                          style={{
                            "font-size": "0.9rem",
                            "font-weight": "600",
                            color: "#676c7d",
                            "text-transform": "uppercase",
                          }}
                        >
                          {" "}
                          No Data
                        </IonText>
                      </div>
                    </IonItem>
                  )}
                </IonRadioGroup>
              </IonList>
            </div>
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
                id="present-alert"
              >
                Ok
              </IonButton>
            </IonToolbar>
          </IonFooter>

          <IonAlert
            trigger="present-alert"
            header="Check the technician before proceed."
            buttons={[
              {
                text: "No",
                cssClass: "alert-button-no",
              },
              {
                text: "Transfer",
                role: "confirm",
                cssClass: "alert-button-primary",
                handler: () => {
                  handleTransfer();
                },
              },
            ]}
          ></IonAlert>
        </IonModal>
      </IonContent>

      <IonFooter className="ion-footer">
        {transferItems.length > 0 ? (
          <IonToolbar>
            <IonButton
              className="ion-button"
              color="primary"
              expand="full"
              onClick={handleNext}
            >
              Next
            </IonButton>
          </IonToolbar>
        ) : null}
      </IonFooter>
      
    </>
  );
};

export default StockTransfer;
