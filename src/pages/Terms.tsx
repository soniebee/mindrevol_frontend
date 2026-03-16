import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại trang chủ
        </Link>

        <h1 className="text-3xl font-bold mb-2">Điều khoản sử dụng</h1>
        <p className="text-zinc-500 mb-8">Cập nhật lần cuối: 01/2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Chấp nhận điều khoản</h2>
            <p>
              Bằng việc tạo tài khoản hoặc sử dụng ứng dụng MindRevol, bạn đồng ý tuân thủ các Điều khoản sử dụng này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Tài khoản người dùng</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
              <li>Bạn phải cung cấp thông tin chính xác khi đăng ký (Email, Tên, Ngày sinh).</li>
              <li>Bạn phải đủ 13 tuổi trở lên để sử dụng dịch vụ này.</li>
              <li>Chúng tôi có quyền khóa hoặc xóa tài khoản của bạn nếu phát hiện vi phạm điều khoản mà không cần báo trước.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Quy tắc ứng xử & Nội dung</h2>
            <p>MindRevol là một cộng đồng tích cực. Bạn <strong>không được phép</strong>:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Đăng tải nội dung khiêu dâm, bạo lực, thù địch hoặc vi phạm pháp luật.</li>
              <li>Quấy rối, đe dọa hoặc mạo danh người dùng khác.</li>
              <li>Spam, quảng cáo trái phép hoặc phát tán mã độc.</li>
              <li>Sử dụng các công cụ tự động (bot) để gian lận tính năng check-in hoặc streak.</li>
            </ul>
            <p className="mt-2">
              Chúng tôi có quyền gỡ bỏ bất kỳ nội dung nào vi phạm các quy tắc trên.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Quyền sở hữu nội dung</h2>
            <p>
              Bạn giữ quyền sở hữu đối với nội dung (ảnh, video, bài viết) bạn đăng tải lên MindRevol. Tuy nhiên, bằng việc đăng tải, bạn cấp cho chúng tôi quyền sử dụng, hiển thị và phân phối nội dung đó trong phạm vi dịch vụ của MindRevol (ví dụ: hiển thị trên Newsfeed, gợi ý cho bạn bè).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Dịch vụ trả phí & Hoàn tiền</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>MindRevol cung cấp các gói nâng cấp (Premium/Gold) để mở khóa tính năng nâng cao.</li>
              <li>Các giao dịch thanh toán được thực hiện qua cổng thanh toán của bên thứ ba.</li>
              <li>Do tính chất của sản phẩm kỹ thuật số, chúng tôi <strong>không hỗ trợ hoàn tiền</strong> trừ khi do lỗi kỹ thuật từ phía hệ thống của chúng tôi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Từ chối trách nhiệm</h2>
            <p>
              Dịch vụ được cung cấp trên cơ sở "nguyên trạng". Chúng tôi không cam kết rằng dịch vụ sẽ luôn không bị gián đoạn, an toàn hoặc không có lỗi. MindRevol không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có thể cập nhật các điều khoản này theo thời gian. Chúng tôi sẽ thông báo cho bạn về những thay đổi quan trọng. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;