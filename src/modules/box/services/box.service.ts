import { http } from "@/lib/http";
import { 
    BoxPageResponse, 
    BoxResponse, 
    BoxDetailResponse,
    CreateBoxRequest, 
    UpdateBoxRequest, 
    BoxMemberPageResponse,
    BoxInvitationResponse,
    BoxTab
} from '../types';

export const boxService = {
    // 1. Lấy danh sách Box (Đã thêm tab và search)
    getMyBoxes: async (tab: BoxTab = 'all', search: string = '', page = 0, size = 20): Promise<BoxPageResponse> => {
        const response = await http.get(`/boxes?tab=${tab}&search=${encodeURIComponent(search)}&page=${page}&size=${size}`);
        return response.data.data;
    },

    // 2. Lấy chi tiết Box
    getBoxDetails: async (boxId: string): Promise<BoxDetailResponse> => {
        const response = await http.get(`/boxes/${boxId}`);
        return response.data.data;
    },

    // 3. Tạo Box mới
    createBox: async (data: CreateBoxRequest): Promise<BoxResponse> => {
        const response = await http.post('/boxes', data);
        return response.data.data;
    },

    // 4. Cập nhật Box
    updateBox: async (boxId: string, data: UpdateBoxRequest): Promise<BoxResponse> => {
        const response = await http.put(`/boxes/${boxId}`, data);
        return response.data.data;
    },

    // 5. Xóa Box
    disbandBox: async (boxId: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}`);
        return response.data?.message || "Box deleted";
    },

    // 6. Rời khỏi Box
    leaveBox: async (boxId: string, myUserId?: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}/leave`);
        return response.data?.message || "Left Box";
    },

    // 7. Chuyển nhượng Box
    transferOwnership: async (boxId: string, newOwnerId: string): Promise<string> => {
        const response = await http.put(`/boxes/${boxId}/transfer-ownership/${newOwnerId}`);
        return response.data?.message || "Ownership transferred";
    },

    // 8. Mời thành viên
    inviteMember: async (boxId: string, targetUserId: string): Promise<string> => {
        const response = await http.post(`/boxes/${boxId}/invites`, { inviteeId: targetUserId });
        return response.data?.message || "Invitation sent";
    },

    // 9. Chấp nhận lời mời
    acceptInvite: async (invitationId: number): Promise<string> => {
        const response = await http.post(`/boxes/invitations/${invitationId}?accept=true`);
        return response.data?.message || "Invitation accepted";
    },

    // 10. Từ chối lời mời
    rejectInvite: async (invitationId: number): Promise<string> => {
        const response = await http.post(`/boxes/invitations/${invitationId}?accept=false`);
        return response.data?.message || "Invitation declined";
    },

    // 11. Kick thành viên
    removeMember: async (boxId: string, targetUserId: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}/members/${targetUserId}`);
        return response.data?.message || "Member removed";
    },

    // 12. Lấy lời mời đang chờ (Đã thêm search)
    getMyPendingInvitations: async (search: string = ''): Promise<BoxInvitationResponse[]> => {
        try {
            const response = await http.get(`/boxes/invitations/me?search=${encodeURIComponent(search)}`);
            return response.data?.data || [];
        } catch (error) {
            console.warn("Backend does not have API GET /boxes/invitations/me");
            return []; 
        }
    },

    getBoxJourneys: async (boxId: string, page = 0, size = 20) => {
        try {
            const response = await http.get(`/boxes/${boxId}/journeys?page=${page}&size=${size}`);
            return response.data?.data;
        } catch (error) {
            return { content: [] };
        }
    },

    getBoxMembers: async (boxId: string, page = 0, size = 50): Promise<BoxMemberPageResponse> => {
        try {
            const response = await http.get(`/boxes/${boxId}/members?page=${page}&size=${size}`);
            return response.data?.data;
        } catch (error) {
            return { 
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                size: size
            } as unknown as BoxMemberPageResponse;
        }
    }
};