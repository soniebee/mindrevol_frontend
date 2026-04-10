import { http } from "@/lib/http";

export const fileService = {
    // Gọi endpoint uploadFile ở Backend
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await http.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        // Backend trả về fileUrl trong trường data
        return response.data.data;
    }
};