import React, { useState, useEffect, useCallback } from "react";
import { IonContent, IonPage, IonToast } from "@ionic/react";
import { useHistory } from "react-router";
import CommonHeader from "../components/CommonHeader";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Geolocation } from "@capacitor/geolocation";
import "./SiteViewLocation.css";
import { useParams } from "react-router-dom";
import { getvisittraveldetails } from "../data/apidata/taskApi/taskDataApi";
import { toast } from "react-toastify";

const SiteViewLocation: React.FC = () => {
  const params: any = useParams();
  const history = useHistory();
  const [startPosition, setStartPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [toPosition, setToPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [waypoints, setWaypoints] = useState<google.maps.DirectionsWaypoint[]>(
    []
  );

  const apiKey = "AIzaSyDY_mNvqPbcGCRiwor1IVcJ5pyRmstm9XY"; // Update with your API key
  let taskId = "";

  const goBack = () => {
    history.goBack();
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const calculateRoute = useCallback(
    async (
      fromPos: { lat: number; lng: number },
      toPos: { lat: number; lng: number },
      waypoints: google.maps.DirectionsWaypoint[] = []
    ) => {
      if (!isLoaded) return;

      const directionsService = new google.maps.DirectionsService();
      const request = {
        origin: new google.maps.LatLng(fromPos.lat, fromPos.lng),
        destination: new google.maps.LatLng(toPos.lat, toPos.lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log("Driving directions result", result);
          setDirections(result);

          const newWaypoints: google.maps.DirectionsWaypoint[] = [];

          // Analyze the route steps for direction changes
          result.routes[0].legs.forEach((leg) => {
            leg.steps.forEach((step) => {
              if (
                step.maneuver &&
                (step.maneuver.includes("turn") ||
                  step.maneuver.includes("fork") ||
                  step.maneuver.includes("merge"))
              ) {
                newWaypoints.push({
                  location: step.end_location,
                  stopover: true,
                });
              }
            });
          });

          if (newWaypoints.length > 0) {
            setWaypoints(newWaypoints);
            // Recalculate route with new waypoints
            const newRequest = {
              ...request,
              waypoints: newWaypoints,
            };
            directionsService.route(newRequest, (newResult, newStatus) => {
              if (newStatus === google.maps.DirectionsStatus.OK && newResult) {
                setDirections(newResult);
              } else {
                console.error(
                  "Error recalculating route with waypoints:",
                  newStatus
                );
              }
            });
          }
        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
          console.warn("No route found between the locations.");
          setToastMessage("No route found between the locations.");
          setShowToast(true);
          setDirections(null);
        } else {
          console.error("Error calculating route:", status);
          setToastMessage(`Error calculating route: ${status}`);
          setShowToast(true);
        }
      });
    },
    [isLoaded]
  );

  useEffect(() => {
    loadTaskFromParams();
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const fetchData = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const position = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };

      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        console.error("SiteView: User data is not available");
        return;
      }
      const userData = JSON.parse(userDataString);
      let taskId = params.taskId;
      console.log("SiteView: Task ID from params = " + taskId);

      const requestBody = {
        visit_id: taskId,
      };
      const responseData = await getvisittraveldetails(requestBody);
      console.log(responseData);

      if (responseData.success && responseData.data.task.length > 1) {
        const start = responseData.data.task.find(
          (task: any) => task.tracking_type === "Start"
        );
        const end = responseData.data.task.find(
          (task: any) => task.tracking_type === "Stop"
        );

        if (start && end) {
          const fromPos = {
            lat: parseFloat(start.latitude),
            lng: parseFloat(start.longitude),
          };
          const toPos = {
            lat: parseFloat(end.latitude),
            lng: parseFloat(end.longitude),
          };
          console.log("Start position:", fromPos);
          console.log("End position:", toPos);

          setStartPosition(fromPos);
          setToPosition(toPos);
          await calculateRoute(fromPos, toPos);
        }
      }
    } catch (error) {
      console.error(
        "Error getting current position or fetching travel data:",
        error
      );
      toast.error("Server not responding. Please try again later.");
    }
  };

  const loadTaskFromParams = () => {
    taskId = params.taskId;
    console.log("Loading task ID from params =", taskId);
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    const newWaypoint = {
      location: {
        lat: e.latLng?.lat()!,
        lng: e.latLng?.lng()!,
      },
      stopover: true,
    };

    setWaypoints((prevWaypoints) => {
      const updatedWaypoints = [...prevWaypoints, newWaypoint];
      console.log("Updated Waypoints:", updatedWaypoints);
      return updatedWaypoints;
    });

    if (startPosition && toPosition) {
      await calculateRoute(startPosition, toPosition, [
        ...waypoints,
        newWaypoint,
      ]);
    }
  };

  return (
    <IonPage>
      <CommonHeader
        backToPath="/site"
        pageTitle="View Location"
        showIcons={false}
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={18000}
      />
      <IonContent fullscreen className="ionContentColor">
        <div className="ion-padding-horizontal">
          {isLoaded && startPosition && (
            <div
              style={{ width: "100%", height: "400px", touchAction: "none" }}
              className="map-container"
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={startPosition}
                zoom={6}
                // onClick={handleMapClick}
              >
                <Marker position={startPosition} label="Start" />
                {toPosition && <Marker position={toPosition} label="End" />}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>
          )}
          {!isLoaded && (
            <div className="alert-message">
              <p>Google Map failed to load.</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SiteViewLocation;
