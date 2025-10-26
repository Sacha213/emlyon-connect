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
  const hasInitialized = useRef(false); // Pour ne centrer qu'une fois

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
      // Initialiser la carte (position par défaut, sera mise à jour par currentUserLocation)
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([48.8566, 2.3522], 12);

      // Utiliser OpenStreetMap standard avec tous les POI (restaurants, bars, cafés, commerces)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
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

  // Centrer la carte sur la position de l'utilisateur une seule fois
  useEffect(() => {
    if (!hasInitialized.current && mapInstance.current && currentUserLocation) {
      mapInstance.current.setView([currentUserLocation.latitude, currentUserLocation.longitude], 15);
      hasInitialized.current = true;
      console.log('🗺️ Carte centrée sur la position utilisateur:', currentUserLocation);
    }
  }, [currentUserLocation]);

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

    // Ne plus recentrer automatiquement sur les check-ins
    // La carte est centrée sur l'utilisateur via le useEffect ci-dessus

  }, [checkIns]);

  // Plus besoin d'afficher la position de l'utilisateur

  return (
    <>
      <div ref={mapRef} className="h-[600px] w-full rounded-md" />
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
      `}</style>
    </>
  );
};

export default MapComponent;