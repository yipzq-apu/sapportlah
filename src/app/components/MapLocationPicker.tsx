'use client';

import { useState, useEffect, useRef } from 'react';

// Global flag to track if Google Maps API is loaded
declare global {
  interface Window {
    google: any;
    googleMapsLoading: boolean;
    googleMapsLoadPromise: Promise<void> | null;
  }
}

interface Location {
  lat: number;
  lng: number;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  onCancel?: () => void;
  initialLocation?: Location;
}

export default function MapLocationPicker({
  onLocationSelect,
  onCancel,
  initialLocation,
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGoogleMapsAndInitialize();
  }, []);

  const loadGoogleMapsAndInitialize = async () => {
    try {
      await loadGoogleMapsAPI();
      initMap();
    } catch (err) {
      console.error('Failed to load Google Maps:', err);
      setError('Failed to load map. Please try again.');
      setLoading(false);
    }
  };

  const loadGoogleMapsAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if Google Maps is currently loading
      if (window.googleMapsLoading && window.googleMapsLoadPromise) {
        window.googleMapsLoadPromise.then(resolve).catch(reject);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        // Script exists but Google Maps might not be ready yet
        const checkGoogle = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      // Set loading flag
      window.googleMapsLoading = true;

      // Create the promise for other components to wait for
      window.googleMapsLoadPromise = new Promise(
        (promiseResolve, promiseReject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            window.googleMapsLoading = false;
            promiseResolve();
            resolve();
          };

          script.onerror = () => {
            window.googleMapsLoading = false;
            const error = new Error('Failed to load Google Maps API');
            promiseReject(error);
            reject(error);
          };

          document.head.appendChild(script);
        }
      );
    });
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = initialLocation || { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur default

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new google.maps.Marker({
      position: defaultLocation,
      map: mapInstance,
      draggable: true,
    });

    // Add click listener to map
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocation({ lat, lng });
      }
    });

    // Add drag listener to marker
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        updateLocation({ lat, lng });
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
    setLoading(false);

    // If there's an initial location, get its address
    if (initialLocation) {
      updateLocation(initialLocation);
    }
  };

  const updateLocation = async (location: Location) => {
    setSelectedLocation(location);

    if (marker) {
      marker.setPosition(location);
    }

    if (map) {
      map.setCenter(location);
    }

    // Reverse geocoding to get human-readable address
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location });

      if (response.results[0]) {
        const result = response.results[0];
        const addressComponents = result.address_components;

        // Use the formatted address as the main address
        const humanReadableAddress = result.formatted_address;
        setAddress(humanReadableAddress);

        // Extract specific address components
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let postalCode = '';
        let country = '';

        addressComponents.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (
            types.includes('locality') ||
            types.includes('sublocality')
          ) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        });

        // Create a cleaner street address if components are available
        let cleanStreetAddress = humanReadableAddress;
        if (streetNumber && route) {
          cleanStreetAddress = `${streetNumber} ${route}`;
        } else if (route) {
          cleanStreetAddress = route;
        }

        // Store the location data with human-readable address
        setSelectedLocation({
          ...location,
          address: cleanStreetAddress,
          city,
          state,
          postalCode,
          country,
        } as any);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to coordinates if geocoding fails
      setAddress(
        `Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      );
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      const locationData = selectedLocation as any;
      onLocationSelect({
        address: locationData.address || address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        city: locationData.city || '',
        state: locationData.state || '',
        postalCode: locationData.postalCode || '',
        country: locationData.country || '',
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateLocation(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => {
              setError('');
              setLoading(true);
              loadGoogleMapsAndInitialize();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            Click on the map or drag the marker to select your location
          </p>
          {address && (
            <p className="text-sm font-medium text-gray-900 mt-1">{address}</p>
          )}
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          📍 Current Location
        </button>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-300"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-600">Loading map...</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmLocation}
          disabled={!selectedLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
