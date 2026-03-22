import { http } from '../../../lib/http';

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  NUDITY = 'NUDITY',
  VIOLENCE = 'VIOLENCE',
  SCAM = 'SCAM',
  FAKE_NEWS = 'FAKE_NEWS',
  OTHER = 'OTHER'
}

export enum ReportTargetType {
  USER = 'USER',
  JOURNEY = 'JOURNEY',
  CHECKIN = 'CHECKIN',
  COMMENT = 'COMMENT'
}

export interface CreateReportRequest {
  targetId: string; // UUID hoặc ID
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
}

export const reportService = {
  createReport: async (data: CreateReportRequest) => {
    return http.post('/api/v1/reports', data);
  }
};