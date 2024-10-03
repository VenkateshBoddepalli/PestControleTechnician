import React, { useEffect, useRef } from 'react';
import { useField } from 'formik';
import { IonInput, IonItem } from '@ionic/react';

interface AddressSearchProps {
  name: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ name, setFieldValue }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [field, meta, helpers] = useField(name);

  useEffect(() => {
    if (!inputRef.current) return;
  
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: {
        country: ['AE']
      }
    });
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log(place);
  
      if (!place.geometry) {
        console.log("No location data available for input: '" + place.name + "'");
        return;
      }
  
      // Initialize Geocoder
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ 'placeId': place.place_id }, (results, status) => {
        if (status === 'OK') {
          if (results &&  [0]) { // Check if results and first result are not null
            
            const latitude = results[0].geometry.location.lat();
            const longitude = results[0].geometry.location.lng();
            setFieldValue(name, place.formatted_address);
            setFieldValue('gps', `${latitude}, ${longitude}`);
            console.log("Latitude: " + latitude);
            console.log("Longitude: " + longitude);
  
            // Use latitude and longitude as needed
            // For example, you can update state or call a function here
  
            // Example: Set form values
            // setFieldValue(`${name}.latitude`, latitude); // Assuming you store latitude in form
            // setFieldValue(`${name}.longitude`, longitude); // Assuming you store longitude in form
  
            helpers.setTouched(true);
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });
    });
  }, [name, setFieldValue, helpers]);
  

  return (
    <IonItem lines="none" className='width100'>
      <input
        ref={inputRef}
        type="text"
        className={`custom-form-control ${meta.touched && meta.error ? 'is-invalid' : ''}`}
        placeholder="Search address"
        onChange={(e) => setFieldValue(name, e.target.value)}
        onBlur={() => helpers.setTouched(true)}
      />
    </IonItem>
  );
};

export default AddressSearch;
