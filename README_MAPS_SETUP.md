# Google Maps Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for search functionality)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## Step 2: Configure Environment Variables

Add your Google Maps API key to `.env`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Step 3: Features

The map component includes:

- Click to select location
- Drag marker to adjust position
- Reverse geocoding to get full address
- Current location detection
- Auto-fill city, state, postal code, and country

## Step 4: Alternative (Free Option)

If you prefer not to use Google Maps, you can use OpenStreetMap with Leaflet:

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

This would be a free alternative but with fewer features.
