import React, { useEffect, useRef } from 'react';
import type { CheckIn } from '../types';

interface MapComponentProps {
  checkIns: CheckIn[];
  currentUserLocation?: { latitude: number; longitude: number } | null;
}

// Déclarer L pour éviter les erreurs TypeScript avec la bibliothèque Leaflet chargée globalement
declare const L: any;

const MapComponent: React.FC<MapComponentProps> = ({ checkIns, currentUserLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const clusterGroup = useRef<any>(null);
  const currentLocationMarker = useRef<any>(null);

  const timeSince = (date: number) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)}m`;
    return `à l'instant`;
  };

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([48.8566, 2.3522], 12); // Centré sur Paris

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      clusterGroup.current = L.markerClusterGroup({
        iconCreateFunction: function (cluster: any) {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="marker-cluster-custom"><span>${count}</span></div>`,
            className: 'bg-transparent border-none',
            iconSize: L.point(40, 40, true),
          });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });

      mapInstance.current.addLayer(clusterGroup.current);
    }
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !clusterGroup.current) return;

    // Nettoyer les anciens marqueurs
    clusterGroup.current.clearLayers();

    const markers: any[] = [];
    // Ajouter les nouveaux marqueurs au groupe de clusters
    checkIns.forEach(checkIn => {
      const iconHTML = `
        <div class="relative">
            <img src="${checkIn.user.avatarUrl}" alt="${checkIn.user.name}" class="w-10 h-10 rounded-md object-cover border-2 border-brand-secondary shadow-lg">
            ${checkIn.statusEmoji ? `<span class="marker-status-emoji">${checkIn.statusEmoji}</span>` : ''}
        </div>
      `;
      const icon = L.divIcon({
        html: iconHTML,
        className: 'bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 40], // Anchor at bottom center of the icon
      });

      const marker = L.marker([checkIn.latitude, checkIn.longitude], { icon });
      marker.bindPopup(`
        <div class="text-center p-1">
          <p class="font-bold text-brand-dark">${checkIn.user.name}</p>
          <p class="text-sm text-brand-subtle">${checkIn.statusEmoji || ''} ${checkIn.locationName}</p>
          <p class="text-xs text-brand-subtle opacity-75">${timeSince(checkIn.timestamp)}</p>
        </div>
      `, {
        closeButton: false,
        className: 'custom-popup'
      });

      markers.push(marker);
    });

    clusterGroup.current.addLayers(markers);

    // Ajuster la vue de la carte pour montrer tous les marqueurs
    if (checkIns.length > 0) {
      mapInstance.current.fitBounds(clusterGroup.current.getBounds().pad(0.5));
    } else {
      mapInstance.current.setView([48.8566, 2.3522], 12);
    }

  }, [checkIns]);

  // Afficher la position actuelle de l'utilisateur
  useEffect(() => {
    if (!mapInstance.current) return;

    // Supprimer l'ancien marqueur de position
    if (currentLocationMarker.current) {
      mapInstance.current.removeLayer(currentLocationMarker.current);
      currentLocationMarker.current = null;
    }

    // Ajouter le nouveau marqueur de position si disponible
    if (currentUserLocation) {
      const icon = L.divIcon({
        html: `
          <div class="current-location-marker">
            <div class="pulse-ring"></div>
            <div class="current-location-dot"></div>
          </div>
        `,
        className: 'bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      currentLocationMarker.current = L.marker(
        [currentUserLocation.latitude, currentUserLocation.longitude],
        { icon, zIndexOffset: 1000 }
      ).addTo(mapInstance.current);

      currentLocationMarker.current.bindPopup(`
        <div class="text-center p-1">
          <p class="font-bold text-blue-600">📍 Vous êtes ici</p>
        </div>
      `, {
        closeButton: false,
        className: 'custom-popup'
      });

      // Centrer la carte sur la position actuelle
      mapInstance.current.setView(
        [currentUserLocation.latitude, currentUserLocation.longitude],
        15
      );
    }

  }, [currentUserLocation]);

  return (
    <>
      <div ref={mapRef} className="h-96 w-full rounded-b-md" />
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #212121; /* brand-light */
          color: #FFFFFF; /* brand-dark */
          border-radius: 8px;
          border: 1px solid #303030; /* brand-secondary */
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }
        .leaflet-popup-content {
          margin: 10px;
          font-family: 'Inter', sans-serif;
        }
        .leaflet-popup-tip-container {
            display: none;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #8c8c8c !important; /* brand-subtle */
        }
        .marker-cluster-custom {
            background-color: #E50914; /* brand-emlyon red */
            border: 2px solid rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            transition: all 0.2s ease-in-out;
        }
        .marker-cluster-custom:hover {
            transform: scale(1.1);
        }
        .marker-cluster-custom span {
            line-height: 40px;
            text-align: center;
        }
        .marker-status-emoji {
            position: absolute;
            bottom: -5px;
            right: -5px;
            background-color: #212121; /* brand-light */
            border: 1px solid #303030; /* brand-secondary */
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .current-location-marker {
            position: relative;
            width: 40px;
            height: 40px;
        }
        .current-location-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            background-color: #3B82F6; /* blue-500 */
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
            z-index: 2;
        }
        .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 2px solid #3B82F6;
            border-radius: 50%;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            z-index: 1;
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1.2);
            }
        }
      `}</style>
    </>
  );
};

export default MapComponent;