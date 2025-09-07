'use client';

import { useState, useEffect } from 'react';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface MapLocationPickerProps {
  initialLocation?: string;
  onLocationSelect: (location: LocationData) => void;
}

export default function MapLocationPicker({
  initialLocation = '',
  onLocationSelect,
}: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );

  useEffect(() => {
    if (initialLocation) {
      setSearchQuery(initialLocation);
    }
  }, [initialLocation]);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim (OpenStreetMap) API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&countrycodes=my,sg&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleLocationSelect = (location: any) => {
    const locationData: LocationData = {
      address: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
    };

    setSelectedLocation(locationData);
    setSearchQuery(location.display_name);
    setSuggestions([]);
    onLocationSelect(locationData);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          if (response.ok) {
            const data = await response.json();
            const locationData: LocationData = {
              address: data.display_name,
              latitude,
              longitude,
            };

            setSelectedLocation(locationData);
            setSearchQuery(data.display_name);
            onLocationSelect(locationData);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          alert('Could not get address for your location');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        console.error('Error getting location:', error);
        alert('Could not get your current location');
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
          placeholder="Search for your location..."
        />

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
        >
          {loading ? 'Getting...' : 'Use Current'}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="border border-gray-300 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLocationSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition duration-200"
            >
              <div className="text-sm font-medium text-gray-900">
                {location.display_name}
              </div>
              <div className="text-xs text-gray-500">
                {location.type &&
                  `${location.type} • Lat: ${parseFloat(location.lat).toFixed(
                    4
                  )}, Lng: ${parseFloat(location.lon).toFixed(4)}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected location display */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-green-800">
                Selected Location:
              </div>
              <div className="text-sm text-green-700 mt-1">
                {selectedLocation.address}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Coordinates:{' '}
                {selectedLocation.latitude.toFixed(4)},{' '}
                {selectedLocation.longitude.toFixed(4)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedLocation(null);
                setSearchQuery('');
                onLocationSelect({ address: '', latitude: 0, longitude: 0 });
              }}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Start typing to search for locations, or click "Use Current" to use your
        current location.
      </div>
    </div>
  );
}
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
          onClick={() => onLocationSelect({ address: '', lat: 0, lng: 0 })}
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
