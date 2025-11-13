import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export function InteractiveMap({ 
  latitude = 51.5099, 
  longitude = -0.1415,
  address = "London, United Kingdom"
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if MAPBOX_TOKEN is available (from environment or secrets)
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      setMapError(true);
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 15,
        pitch: 45,
      });

      // Add custom marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkE1MDAiLz4KPHBhdGggZD0iTTIwIDhDMTUuNTgxNyA4IDEyIDExLjU4MTcgMTIgMTZDMTIgMjEuNSAyMCAzMiAyMCAzMkMyMCAzMiAyOCAyMS41IDI4IDE2QzI4IDExLjU4MTcgMjQuNDE4MyA4IDIwIDhaIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE2IiByPSIzIiBmaWxsPSIjRkZBNTAwIi8+Cjwvc3ZnPgo=)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(true);
    }
  }, [latitude, longitude]);

  if (mapError) {
    return (
      <div className="relative w-full h-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <MapPin className="w-12 h-12 text-accent mx-auto" />
          <div>
            <h3 className="font-kanit text-lg font-bold text-primary mb-2">
              View on Map
            </h3>
            <p className="font-sans text-sm text-muted-foreground mb-4">
              {address}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-sans font-semibold text-sm transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-accent mx-auto mb-2 animate-bounce" />
            <p className="font-sans text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
