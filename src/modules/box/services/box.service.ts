import { http } from "@/lib/http";
import { 
    BoxPageResponse, 
    BoxResponse, 
    CreateBoxRequest, 
    UpdateBoxRequest, 
    BoxMemberPageResponse,
    BoxInvitationResponse 
} from '../types';

export const boxService = {
    // 1. Lấy danh sách Box (Khớp với @GetMapping ở BE)
    getMyBoxes: async (page = 0, size = 20): Promise<BoxPageResponse> => {
        const response = await http.get(`/boxes?page=${page}&size=${size}`);
        return response.data.data;
    },

    // 2. Lấy chi tiết Box
    getBoxDetails: async (boxId: string): Promise<BoxResponse> => {
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

    // 5. Xóa Box (Tương đương giải tán)
    disbandBox: async (boxId: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}`);
        return response.data?.message || "Đã xóa Box";
    },

    // 6. Rời khỏi Box (Khớp với @DeleteMapping("/{boxId}/leave"))
    leaveBox: async (boxId: string, myUserId?: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}/leave`);
        return response.data?.message || "Đã rời Box";
    },

    // 7. Chuyển nhượng Box
    transferOwnership: async (boxId: string, newOwnerId: string): Promise<string> => {
        const response = await http.put(`/boxes/${boxId}/transfer-ownership/${newOwnerId}`);
        return response.data?.message || "Đã chuyển nhượng";
    },

    // ==========================================
    // QUẢN LÝ LỜI MỜI VÀ THÀNH VIÊN
    // ==========================================

    // 8. Mời thành viên (Khớp với @PostMapping("/{boxId}/invites"))
    inviteMember: async (boxId: string, targetUserId: string): Promise<string> => {
        const response = await http.post(`/boxes/${boxId}/invites`, { inviteeId: targetUserId });
        return response.data?.message || "Đã gửi lời mời";
    },

    // 9. Chấp nhận lời mời (Khớp với @PostMapping("/invitations/{invitationId}?accept=true"))
    acceptInvite: async (invitationId: string): Promise<string> => {
        const response = await http.post(`/boxes/invitations/${invitationId}?accept=true`);
        return response.data?.message || "Đã chấp nhận lời mời";
    },

    // 10. Từ chối lời mời (Khớp với @PostMapping("/invitations/{invitationId}?accept=false"))
    rejectInvite: async (invitationId: string): Promise<string> => {
        const response = await http.post(`/boxes/invitations/${invitationId}?accept=false`);
        return response.data?.message || "Đã từ chối lời mời";
    },

    // 11. Kick thành viên (Khớp với @DeleteMapping("/{boxId}/members/{memberId}"))
    removeMember: async (boxId: string, targetUserId: string): Promise<string> => {
        const response = await http.delete(`/boxes/${boxId}/members/${targetUserId}`);
        return response.data?.message || "Đã xóa thành viên";
    },

    // ==========================================
    // CÁC API HIỆN BE ĐANG THIẾU -> DÙNG TRY-CATCH ĐỂ FE KHÔNG BỊ SẬP
    // ==========================================

    getMyPendingInvitations: async (): Promise<BoxInvitationResponse[]> => {
        try {
            // BE chưa có hàm GET cho URL này
            const response = await http.get(`/boxes/invitations/me`);
            return response.data?.data || [];
        } catch (error) {
            console.warn("Backend chưa có API GET /boxes/invitations/me");
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
            // Ép kiểu để TypeScript không báo lỗi thiếu các trường phân trang (totalElements, totalPages...)
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