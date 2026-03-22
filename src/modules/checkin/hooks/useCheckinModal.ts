import { useState, useEffect, useRef, useCallback } from 'react';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { journeyService } from '@/modules/journey/services/journey.service'; 
import { UserActiveJourneyResponse } from '@/modules/journey/types'; 
import imageCompression from 'browser-image-compression';
import { Emotion } from '@/modules/checkin/types';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'react-hot-toast'; 
import exifr from 'exifr'; 

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' }));
      else resolve(null);
    }, 'image/jpeg', 0.95);
  });
};

export enum UIActivityType {
  LEARNING = 'LEARNING', WORKING = 'WORKING', EXERCISING = 'EXERCISING',
  CHILLING = 'CHILLING', EATING = 'EATING', DATING = 'DATING',
  GAMING = 'GAMING', TRAVELING = 'TRAVELING', READING = 'READING',
  CREATING = 'CREATING', CUSTOM = 'CUSTOM'
}

export const ACTIVITY_PRESETS = [
  { type: UIActivityType.LEARNING, label: 'Học bài', emoji: '📚', color: 'bg-blue-600' },
  { type: UIActivityType.WORKING, label: 'Làm việc', emoji: '💼', color: 'bg-slate-600' },
  { type: UIActivityType.EXERCISING, label: 'Tập gym', emoji: '💪', color: 'bg-orange-600' },
  { type: UIActivityType.CHILLING, label: 'Chill', emoji: '🌿', color: 'bg-emerald-600' },
  { type: UIActivityType.EATING, label: 'Ăn uống', emoji: '🍜', color: 'bg-yellow-600' },
  { type: UIActivityType.DATING, label: 'Hẹn hò', emoji: '💕', color: 'bg-pink-600' },
  { type: UIActivityType.GAMING, label: 'Game', emoji: '🎮', color: 'bg-purple-600' },
  { type: UIActivityType.TRAVELING, label: 'Du lịch', emoji: '✈️', color: 'bg-sky-500' },
];

const mapEmojiToEmotion = (emoji: string): Emotion => "NORMAL";

interface UseCheckinModalProps {
  file: File | null;
  journeyId: string;
  onSuccess: () => void;
  onClose: () => void;
}

const fetchLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`);
        const data = await response.json();
        
        if (data.address) {
            const addr = data.address;
            const landmark = addr.amenity || addr.tourism || addr.historic || addr.leisure || addr.building || data.name;
            const localArea = addr.road || addr.suburb || addr.town || addr.village;
            const city = addr.city || addr.state || addr.province;

            if (landmark && city) return `${landmark}, ${city}`;
            if (landmark) return landmark;
            if (localArea && city) return `${localArea}, ${city}`;
            if (city) return city;
        }
        return data.display_name?.split(',').slice(0, 2).join(',') || "Vị trí của bạn";
    } catch (error) {
        return "Đang xác định vị trí...";
    }
};

export const useCheckinModal = ({ file, journeyId, onSuccess, onClose }: UseCheckinModalProps) => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITY_PRESETS[0]);
  const [customContext, setCustomContext] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('✨');

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isVideo, setIsVideo] = useState(false);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [activeJourneys, setActiveJourneys] = useState<UserActiveJourneyResponse[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(journeyId);
  const [isJourneyDropdownOpen, setIsJourneyDropdownOpen] = useState(false);
  
  const journeyDropdownRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const journeys = await journeyService.getUserActiveJourneys('me');
        setActiveJourneys(journeys);
        if (!selectedJourneyId && journeys.length > 0) setSelectedJourneyId(journeys[0].id);
      } catch (error) {
        console.error("Lỗi tải danh sách hành trình:", error);
      }
    };
    fetchJourneys();
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      const isVideoFile = file.type.startsWith('video/');
      setIsVideo(isVideoFile);

      if (!isVideoFile) {
          const extractExifLocation = async () => {
              setIsLocating(true);
              try {
                  const gps = await exifr.gps(file);
                  if (gps && gps.latitude && gps.longitude) {
                      setLatitude(gps.latitude);
                      setLongitude(gps.longitude);
                      const locName = await fetchLocationName(gps.latitude, gps.longitude);
                      setLocation(locName);
                      toast.success("Đã tìm thấy vị trí gốc của ảnh!");
                  }
              } catch (error) {
                  // Ignore
              } finally {
                  setIsLocating(false);
              }
          };
          extractExifLocation();
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
      if (journeyDropdownRef.current && !journeyDropdownRef.current.contains(event.target as Node)) setIsJourneyDropdownOpen(false);
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) setLocationSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocation(val);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!val.trim()) {
          setLocationSuggestions([]);
          setLatitude(null);
          setLongitude(null);
          return;
      }
      searchTimeoutRef.current = setTimeout(async () => {
          setIsSearchingLocation(true);
          try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(val)}&limit=5&accept-language=vi`);
              const data = await res.json();
              setLocationSuggestions(data);
          } catch (error) {
              console.error("Lỗi tìm kiếm địa điểm", error);
          } finally {
              setIsSearchingLocation(false);
          }
      }, 500);
  };

  const handleSelectSuggestion = (suggestion: any) => {
      const shortName = suggestion.name || suggestion.display_name.split(',')[0];
      setLocation(shortName);
      setLatitude(parseFloat(suggestion.lat));
      setLongitude(parseFloat(suggestion.lon));
      setLocationSuggestions([]);
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
        toast.error("Trình duyệt không hỗ trợ định vị");
        return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLatitude(lat);
            setLongitude(lng);
            const locName = await fetchLocationName(lat, lng);
            setLocation(locName);
            toast.success("Đã lấy vị trí hiện tại!");
            setIsLocating(false);
        },
        (error) => {
            setIsLocating(false);
            toast.error("Không thể lấy vị trí hiện tại.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!file || !previewUrl) return;
    if (!selectedJourneyId) { alert("Vui lòng chọn một hành trình!"); return; }
    
    try {
      setIsSubmitting(true);
      
      let fileToUpload = file;
      
      if (!isVideo) {
          if (croppedAreaPixels) {
              const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels);
              if (croppedImage) fileToUpload = croppedImage;
          }

          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg' };
          if (fileToUpload.size > 1024 * 1024) {
            try { fileToUpload = await imageCompression(fileToUpload, options); } catch (e) { console.warn(e); }
          }
      }

      const isCustom = !!customContext;
      const payload: any = {
        file: fileToUpload,
        journeyId: selectedJourneyId, 
        caption, locationName: location,
        emotion: mapEmojiToEmotion(moodEmoji),
        activityType: isCustom ? UIActivityType.CUSTOM : selectedActivity.type,
        activityName: isCustom ? customContext : selectedActivity.label,
        statusRequest: 'NORMAL'
      };

      if (latitude !== null && longitude !== null) {
          payload.latitude = latitude;
          payload.longitude = longitude;
      }

      await checkinService.createCheckin(payload);
      
      trackEvent('checkin_completed', { journey_id: selectedJourneyId, is_video: isVideo });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi đăng bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    caption, setCaption, location, setLocation, selectedActivity, setSelectedActivity,
    customContext, setCustomContext, moodEmoji, setMoodEmoji, previewUrl, isSubmitting,
    showEmojiPicker, setShowEmojiPicker, pickerRef, handleSubmit,
    crop, setCrop, zoom, setZoom, aspect, setAspect, onCropComplete,
    activeJourneys, selectedJourneyId, setSelectedJourneyId, 
    isJourneyDropdownOpen, setIsJourneyDropdownOpen, journeyDropdownRef,
    latitude, isLocating, handleAutoLocate,
    locationSearch: location, handleLocationInputChange, locationSuggestions, 
    isSearchingLocation, handleSelectSuggestion, locationContainerRef,
    isVideo
  };
};