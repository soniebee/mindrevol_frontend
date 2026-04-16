export type RecapStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RecapResponse {
  id: string;
  userId: string;
  journeyId: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: RecapStatus;
  durationSeconds: number | null;
  bgMusicUrl: string | null;
  createdAt: string;
}