import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại trang chủ
        </Link>

        <h1 className="text-3xl font-bold mb-2">Chính sách quyền riêng tư</h1>
        <p className="text-zinc-500 mb-8">Cập nhật lần cuối: 01/2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Giới thiệu</h2>
            <p>
              Chào mừng bạn đến với <strong>MindRevol</strong> ("chúng tôi"). Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và tôn trọng quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng ứng dụng và dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Thông tin chúng tôi thu thập</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Thông tin tài khoản:</strong> Khi bạn đăng ký, chúng tôi thu thập tên, địa chỉ email, tên đăng nhập (handle), ngày sinh và giới tính. Nếu bạn đăng nhập bằng Google, Facebook hoặc TikTok, chúng tôi sẽ thu thập thông tin hồ sơ công khai của bạn từ các nền tảng đó.
              </li>
              <li>
                <strong>Nội dung người dùng:</strong> Chúng tôi lưu trữ các nội dung bạn tạo ra, bao gồm Hành trình (Journeys), bài viết check-in, hình ảnh, video, bình luận và tin nhắn trò chuyện.
              </li>
              <li>
                <strong>Thông tin thanh toán:</strong> Khi bạn nâng cấp tài khoản, chúng tôi ghi nhận lịch sử giao dịch thông qua cổng thanh toán (ví dụ: SePay). Chúng tôi <strong>không</strong> lưu trữ trực tiếp thông tin thẻ tín dụng hoặc tài khoản ngân hàng của bạn.
              </li>
              <li>
                <strong>Dữ liệu thiết bị và sử dụng:</strong> Chúng tôi thu thập thông tin về thiết bị, địa chỉ IP và cách bạn tương tác với ứng dụng để cải thiện trải nghiệm và phát hiện gian lận.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Cách chúng tôi sử dụng thông tin</h2>
            <p>Chúng tôi sử dụng thông tin của bạn để:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Cung cấp, vận hành và duy trì dịch vụ MindRevol.</li>
              <li>Cá nhân hóa trải nghiệm của bạn (ví dụ: gợi ý hành trình phù hợp).</li>
              <li>Xử lý các giao dịch thanh toán và nâng cấp tài khoản.</li>
              <li>Gửi thông báo quan trọng về tài khoản, bảo mật hoặc cập nhật tính năng.</li>
              <li>Phát hiện và ngăn chặn các hành vi vi phạm tiêu chuẩn cộng đồng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Chia sẻ thông tin</h2>
            <p>
              Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Nhà cung cấp dịch vụ:</strong> Các bên thứ ba hỗ trợ vận hành (ví dụ: Google Cloud, ImageKit để lưu trữ ảnh, Firebase để gửi thông báo).</li>
              <li><strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu hợp pháp từ cơ quan chức năng hoặc để bảo vệ quyền lợi của MindRevol.</li>
              <li><strong>Với sự đồng ý của bạn:</strong> Khi bạn chọn chia sẻ hành trình hoặc bài viết ở chế độ Công khai (Public).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Bảo mật dữ liệu</h2>
            <p>
              Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp (như mã hóa SSL, xác thực JWT hai lớp) để bảo vệ thông tin của bạn. Tuy nhiên, không có phương thức truyền tải nào qua Internet là an toàn tuyệt đối 100%.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Quyền của bạn</h2>
            <p>
              Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất cứ lúc nào thông qua phần Cài đặt trong ứng dụng. Bạn cũng có thể yêu cầu xóa vĩnh viễn tài khoản của mình.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Liên hệ</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào về Chính sách quyền riêng tư này, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@mindrevol.com" className="text-blue-400 hover:underline">support@mindrevol.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;