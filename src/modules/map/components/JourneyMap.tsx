import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css'; 
import { mapService } from '../services/map.service';
import { MapMarkerResponse } from '@/modules/checkin/types';
import { Loader2 } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

interface JourneyMapProps {
  journeyId?: string;
  boxId?: string;
  userId?: string;
  className?: string;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ journeyId, boxId, userId, className }) => {
  const [markers, setMarkers] = useState<MapMarkerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerResponse | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      setLoading(true);
      try {
        let data: MapMarkerResponse[] = [];
        if (journeyId) {
          data = await mapService.getJourneyMarkers(journeyId);
        } else if (boxId) {
          data = await mapService.getBoxMarkers(boxId);
        } else if (userId === 'me') {
          data = await mapService.getMyMarkers();
        }
        setMarkers(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bản đồ:", error);
      } finally {
        setLoading(false);
      }
    };

    if (journeyId || boxId || userId) {
      fetchMarkers();
    }
  }, [journeyId, boxId, userId]);

  const handleMapLoad = (e: any) => {
    if (markers.length > 0) {
      const map = e.target;
      
      const bounds = new mapboxgl.LngLatBounds(); 
      markers.forEach(m => {
        if(m.longitude && m.latitude) bounds.extend([m.longitude, m.latitude]);
      });
      
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 2000 });
    }
  };

  // [ĐÃ SỬA]: Đổi h-[500px] mt-6 thành h-full w-full để Map luôn nằm ngoan ngoãn gọn gàng trong thẻ cha
  const defaultClass = "w-full h-full min-h-[250px] rounded-[inherit] overflow-hidden relative z-0";
  const containerClass = className || defaultClass;

  if (loading) {
    return (
      <div className={`${containerClass} flex items-center justify-center bg-zinc-100 dark:bg-[#1A1A1A] !border-none`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className={`${containerClass} flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#1A1A1A] text-zinc-500 !border-none`}>
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm font-medium">Chưa có địa điểm nào.</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 106.660172,
          latitude: 10.762622,
          zoom: 5
        }}
        mapStyle="mapbox://styles/sonejwt/cmm83hwcx000v01sh197p66jv" 
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="bottom-left" />

        {markers.map((marker) => (
          <Marker
            key={marker.checkinId}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            onClick={(e: any) => { 
              e.originalEvent.stopPropagation();
              setSelectedMarker(marker);
            }}
          >
            <div className="relative cursor-pointer transition-transform hover:scale-110 group origin-bottom">
              <div 
                className="w-12 h-12 rounded-full border-[3px] border-white dark:border-zinc-800 shadow-[0_5px_15px_rgba(0,0,0,0.3)] bg-cover bg-center"
                style={{ backgroundImage: `url('${marker.thumbnailUrl || marker.userAvatar}')` }}
              />
              <img 
                src={marker.userAvatar} 
                className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 border-[2px] border-white dark:border-zinc-800 object-cover"
                alt="Avatar"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-zinc-800" />
            </div>
          </Marker>
        ))}

        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            anchor="bottom"
            offset={56} 
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
            className="custom-mapbox-popup"
          >
            <div className="text-center p-1 w-36">
                <p className="font-bold text-sm mb-1.5 truncate text-zinc-900">{selectedMarker.fullname}</p>
                <img src={selectedMarker.thumbnailUrl} alt="Checkin" className="w-full h-36 object-cover rounded-xl mb-2 shadow-md" />
                <a href={`/checkin/${selectedMarker.checkinId}`} className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors w-full">
                    Xem bài viết
                </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};