import { useEffect, useState } from "react";

interface LocationState {
    loaded: boolean;
    longitude: number | null;
    latitude: number | null;
    error?: {
        code: number;
        message: string;
    };
}

const useLongitudeLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        loaded: false,
        longitude: null,
        latitude: null,
    });

    const onSuccess = (location: GeolocationPosition) => {
        setLocation({
            loaded: true,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,

        });
    };

    const onError = (error: GeolocationPositionError) => {
        setLocation({
            loaded: true,
            longitude: null,
            latitude: null,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3
            });
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, []);

    return location;
};

export default useLongitudeLocation;
