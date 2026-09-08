/**
 * Nội dung trang Chính sách (#policy) — chuyển từ 7 trang chính sách của gocare.vn (tháng 09/2026),
 * đổi tên thương hiệu GoCare → HOMI365, giữ nguyên pháp nhân, hotline, email và nội dung nghiệp vụ.
 * LƯU Ý: đây là nội dung mẫu để dựng giao diện; bản chính thức cần khách/pháp chế rà soát.
 *
 * Cấu trúc: { id, title, intro?, sections: [{ h, items: [ 'đoạn văn' | { list: [...] } | { steps: [...] } ] }] }
 */
const POLICIES = [
  {
    id: 'bao-hanh', title: 'Chính sách bảo hành',
    sections: [
      { h: 'I. Điều kiện bảo hành', items: [
        'Sản phẩm được bảo hành miễn phí nếu đảm bảo tất cả các điều kiện sau:',
        { list: ['Sản phẩm thuộc danh mục được bảo hành từ Nhà sản xuất.', 'Sản phẩm bị lỗi kỹ thuật do Nhà sản xuất.', 'Thời hạn bảo hành ghi trên phiếu bảo hành hoặc tem bảo hành vẫn còn hiệu lực.', 'Tem bảo hành còn nguyên vẹn, không chắp vá, không bị gạch xoá hay sửa chữa, bôi bẩn.', 'Trên thân máy hay linh kiện vẫn còn đủ thông tin nhận dạng: mã sản phẩm, số seri, nhãn hiệu, ngày sản xuất.', 'Tem bảo hành và/hoặc tem niêm phong (nếu có) của Nhà sản xuất/HOMI365 trên sản phẩm còn nguyên vẹn.'] },
        'Sản phẩm không được bảo hành hoặc sẽ phát sinh phí bảo hành nếu rơi vào một trong các trường hợp sau:',
        { list: ['Sản phẩm không thuộc danh mục được bảo hành từ Nhà sản xuất.', 'Sản phẩm không thoả mãn một trong những điều kiện bảo hành ở mục trên.', 'Số seri, model sản phẩm không khớp với Phiếu bảo hành hay thông tin lưu trên hệ thống bảo hành của HOMI365.', 'Khách hàng tự ý can thiệp sửa chữa máy móc/thiết bị mà không có sự đồng ý của HOMI365 hoặc nhà sản xuất.', 'Sản phẩm bị hư hỏng do lỗi người sử dụng, và lỗi hư hỏng không nằm trong phạm vi bảo hành của Nhà sản xuất.', 'Trường hợp bất khả kháng: thiên tai, hoả hoạn, dịch bệnh, chiến tranh…', 'Với trường hợp phát sinh phí bảo hành, chuyên viên chăm sóc khách hàng sẽ tư vấn đầy đủ thông tin cho khách hàng trước khi tiến hành các thủ tục bảo hành.'] }
      ] },
      { h: 'II. Thời hạn bảo hành', items: [
        { list: ['Máy móc/thiết bị: bảo hành 06 tháng hoặc 12 tháng kể từ ngày bàn giao và nghiệm thu, nếu hư hỏng do lỗi kỹ thuật của nhà sản xuất.', 'Linh kiện/phụ kiện: bảo hành 06 tháng kể từ ngày bàn giao và nghiệm thu, nếu hư hỏng do lỗi kỹ thuật của nhà sản xuất.'] }
      ] },
      { h: 'III. Phương thức liên hệ bảo hành', items: [
        'Liên hệ: khi máy móc/thiết bị gặp sự cố trong quá trình sử dụng, Quý khách vui lòng liên hệ bộ phận Chăm sóc khách hàng qua email info@hgtechs.vn hoặc hotline 0982 466 668 để được hỗ trợ.',
        'Địa điểm bảo hành: được thực hiện tại HOMI365 hoặc hiện trường, theo điều kiện ghi trên báo giá/hợp đồng. Với yêu cầu bảo hành tận nơi ở địa điểm xa (hơn 150 km), Quý khách vui lòng hỗ trợ chi phí phát sinh do đi lại như vé máy bay/tàu/xe, phòng khách sạn, ăn uống.',
        'Thời gian thực hiện: trong vòng 24 giờ kể từ khi nhận được thông tin sự cố, HOMI365 sẽ liên hệ khách hàng để kiểm tra tình trạng và đề xuất phương án xử lý phù hợp. Thời gian bảo hành tuỳ thuộc mức độ sẵn có của thiết bị/linh kiện thay thế; bộ phận dịch vụ khách hàng sẽ theo dõi và thông báo kết quả sớm nhất sau khi thiết bị đã bảo hành xong.'
      ] }
    ]
  },
  {
    id: 'doi-tra-hoan-tien', title: 'Chính sách đổi trả và hoàn tiền',
    intro: 'Theo các điều khoản và điều kiện được quy định trong Chính sách này, HOMI365 đảm bảo quyền lợi của Người mua bằng cách cho phép gửi yêu cầu hoàn trả sản phẩm và/hoặc hoàn tiền trong thời hạn quy định.',
    sections: [
      { h: 'I. Chính sách đổi/trả hàng', items: [
        'Thời gian đổi/trả: khách hàng đã mua hàng có thể đổi trả trong vòng ba (03) ngày kể từ khi nhận hàng.',
        'Người mua chỉ có thể yêu cầu đổi/trả hàng và hoàn tiền trong các trường hợp sau:',
        { list: ['Người mua đã thanh toán nhưng không nhận được sản phẩm.', 'Sản phẩm bị lỗi hoặc bị hư hại trong quá trình vận chuyển.', 'Giao sai sản phẩm theo đơn đặt hàng (sai kích cỡ, sai màu sắc…).', 'Sản phẩm nhận được khác biệt rõ rệt so với thông tin mô tả sản phẩm.', 'Khách hàng thay đổi nhu cầu, muốn đổi sản phẩm khác.'] },
        'Điều kiện về hàng hoá đổi trả: sản phẩm nguyên hộp không rách nát, kèm quà tặng (nếu có), chưa bóc tem, nhãn mác, hoá đơn; tuyệt đối không có dấu hiệu đã qua sử dụng. Trường hợp hàng hoá lỗi hoặc hư hại do vận chuyển, khách hàng vui lòng cung cấp video mở hàng/hình ảnh ngay sau khi nhận hàng để chúng tôi xác nhận.',
        'Chi phí đổi trả: lỗi từ phía chúng tôi — chúng tôi chịu hoàn toàn chi phí vận chuyển; do nhu cầu cá nhân muốn đổi sản phẩm khác — khách hàng chịu chi phí trả hàng và giao sản phẩm mới.'
      ] },
      { h: 'II. Chính sách hoàn tiền', items: [
        { list: ['Việc hoàn tiền được tiến hành sau khi đã nhận được hàng hoá đổi trả của khách hàng.', 'Thời gian hoàn tiền: từ 07 đến 15 ngày kể từ khi nhận được hàng trả.', 'Tiền được hoàn vào tài khoản cá nhân do khách hàng cung cấp.', 'Trường hợp khách không muốn nhận sản phẩm do nhu cầu cá nhân thay đổi, chi phí vận chuyển được trừ trực tiếp vào tiền hoàn.'] },
        'Chúng tôi chỉ hoàn tiền khi nhận được hàng trả lại đáp ứng đủ các điều kiện trên.'
      ] },
      { h: 'III. Quy trình đề xuất đổi/trả hàng và hoàn tiền', items: [
        { steps: ['Liên hệ kênh bán hàng đã đặt hàng để yêu cầu đổi/trả; gửi đầy đủ thông tin, hình ảnh thể hiện lỗi sai khác của hàng hoá.', 'Bộ phận xử lý khiếu nại xác minh đơn hàng và đối chiếu quy định; nếu đáp ứng, chúng tôi liên lạc thông báo nội dung chi tiết và yêu cầu của việc đổi/trả.', 'Khách hàng gửi sản phẩm cần đổi trả cùng giấy tờ liên quan (nếu có); giữ nguyên vỏ hộp và phụ kiện đi kèm.', 'HOMI365 nhận lại sản phẩm, thực hiện đổi trả/hoàn tiền và cập nhật tiến trình cho khách hàng.', 'HOMI365 đóng khiếu nại sau khi hoàn trả tiền và thông báo tới khách hàng.'] }
      ] },
      { h: 'IV. Giải quyết tranh chấp, khiếu nại', items: [
        'HOMI365 tiếp nhận khiếu nại qua website, hotline 0982 466 668, email info@hgtechs.vn hoặc trực tiếp tại Công ty TNHH Giải pháp Công nghệ Huy Giáp.',
        'Việc giải quyết khiếu nại dựa trên thoả thuận và đàm phán của các bên. Nếu không thể giải quyết, một trong hai bên có quyền nhờ cơ quan pháp luật có thẩm quyền can thiệp nhằm đảm bảo lợi ích hợp pháp của các bên, đặc biệt là khách hàng.'
      ] }
    ]
  },
  {
    id: 'quy-che-website', title: 'Quy chế hoạt động website bán hàng',
    sections: [
      { h: 'I. Nguyên tắc', items: [
        'Quy chế này áp dụng cho các khách hàng đăng ký mua hàng, tham gia các chương trình khuyến mại được tổ chức trên website bán hàng trực tuyến của HOMI365.',
        'Khách hàng tham gia giao dịch là cá nhân có đầy đủ năng lực hành vi dân sự và phải cung cấp đầy đủ thông tin cá nhân theo yêu cầu.',
        'Tất cả nội dung trong Quy chế tuân thủ hệ thống pháp luật hiện hành của Việt Nam. Khách hàng tự tìm hiểu trách nhiệm pháp lý của mình và cam kết thực hiện đúng nội dung Quy chế.'
      ] },
      { h: 'II. Quy trình giao dịch', items: [
        'Ban quản lý website giới thiệu sản phẩm, mức giá và phương thức thanh toán; khách hàng tham khảo và lựa chọn nếu phù hợp nhu cầu.',
        'Thanh toán trước (chuyển khoản/cổng thanh toán):',
        { steps: ['Khách hàng đặt hàng.', 'Khách hàng thanh toán trước.', 'Ban quản lý website kiểm tra và chuyển hàng.', 'Khách hàng kiểm tra và nhận hàng.'] },
        'Thanh toán sau (nhận hàng tại văn phòng hoặc nơi khách yêu cầu trong phạm vi quy định):',
        { steps: ['Khách hàng đặt hàng.', 'Khách hàng và Ban quản lý xác thực đơn hàng (điện thoại, tin nhắn, email).', 'Ban quản lý xác nhận thông tin khách hàng.', 'Ban quản lý giao hàng.', 'Khách hàng nhận hàng và thanh toán.'] }
      ] },
      { h: 'III. Đảm bảo an toàn giao dịch', items: [
        'Ban quản lý sử dụng các dịch vụ để bảo vệ thông tin và việc thanh toán của khách hàng. Để hạn chế rủi ro, khách hàng lưu ý:',
        { list: ['Không đưa thông tin chi tiết về việc thanh toán cho bất kỳ ai bằng email; chúng tôi không chịu trách nhiệm về mất mát do trao đổi thông tin qua internet hoặc email.', 'Tuyệt đối không sử dụng chương trình, công cụ hay hình thức nào để can thiệp vào hệ thống hay làm thay đổi cấu trúc dữ liệu. Nghiêm cấm phát tán, truyền bá hay cổ vũ hoạt động can thiệp, phá hoại, xâm nhập hệ thống website; mọi vi phạm bị xử lý theo Quy chế và pháp luật.'] }
      ] },
      { h: 'IV. Bảo vệ quyền lợi khách hàng', items: [
        { list: ['Cung cấp đầy đủ thông tin cá nhân liên quan (họ tên, địa chỉ, email, điện thoại…) và chịu trách nhiệm về tính pháp lý của thông tin; Ban quản lý không giải quyết khiếu nại nếu thông tin cung cấp không chính xác.', 'Xem xét kỹ thông tin sản phẩm, dịch vụ: giá, thương hiệu, dịch vụ hỗ trợ, điều kiện sử dụng, phương thức giao hàng, thanh toán, số tài khoản ngân hàng…', 'HOMI365 nỗ lực hợp lý để giải quyết khiếu nại của khách hàng và cam kết bảo mật mọi thông tin giao dịch, trừ trường hợp cơ quan pháp luật yêu cầu.'] }
      ] },
      { h: 'V. Quản lý thông tin xấu', items: [
        { list: ['Khách hàng tự chịu trách nhiệm bảo mật và lưu giữ mọi hoạt động sử dụng dịch vụ dưới tên mua hàng và hộp thư điện tử của mình.', 'Không sử dụng dịch vụ vào mục đích bất hợp pháp, lừa đảo, đe doạ, thăm dò thông tin, phá hoại, phát tán virus, đầu cơ, tạo đơn đặt hàng giả. Trường hợp vi phạm, khách hàng chịu trách nhiệm trước pháp luật.', 'Không thay đổi, chỉnh sửa, sao chép, phân phối hoặc tạo chức năng tương tự của dịch vụ cho bên thứ ba khi chưa được đồng ý.'] }
      ] },
      { h: 'VI. Giới hạn trách nhiệm khi phát sinh lỗi kỹ thuật', items: [
        'HOMI365 không kiểm soát an ninh Internet hoặc mạng khách hàng sử dụng nên không chịu trách nhiệm về sự an toàn của thông tin khách hàng chọn để giao dịch, cũng như dữ liệu bị mất trong quá trình truyền.',
        'Trường hợp phát sinh lỗi kỹ thuật, lỗi phần mềm hoặc lỗi khách quan khiến khách hàng không thể giao dịch, vui lòng thông báo qua email info@hgtechs.vn; Ban quản lý sẽ khắc phục trong thời gian sớm nhất. Ban quản lý không chịu trách nhiệm nếu khiếu nại không đến được do lỗi kỹ thuật, đường truyền, phần mềm không do Ban quản lý gây ra.'
      ] },
      { h: 'VII. Quyền và trách nhiệm của Ban quản lý website', items: [
        { list: ['Tổ chức giới thiệu sản phẩm, dịch vụ với điều kiện khách hàng kê khai đầy đủ thông tin yêu cầu.', 'Có quyền từ chối, tạm ngừng hoặc chấm dứt quyền sử dụng dịch vụ nếu khách hàng cung cấp thông tin không chính xác, vi phạm pháp luật hoặc thuần phong mỹ tục.', 'Giữ bản quyền dịch vụ và nội dung website theo luật bản quyền quốc tế và pháp luật sở hữu trí tuệ Việt Nam; tất cả biểu tượng, nội dung thuộc sở hữu của Công ty TNHH Giải pháp Công nghệ Huy Giáp.', 'Chịu trách nhiệm xây dựng, duy trì website, hợp tác đối tác xây dựng dịch vụ tiện ích, cung cấp thông tin, tư vấn khách hàng thực hiện giao dịch, đặc biệt là thanh toán trực tuyến.', 'Nỗ lực duy trì hoạt động bình thường và khắc phục sự cố kỹ thuật; không chịu trách nhiệm liên đới với sự cố bất khả kháng nằm ngoài khả năng kiểm soát.'] }
      ] },
      { h: 'VIII. Quyền và trách nhiệm của khách hàng', items: [
        { list: ['Được nhân viên HOMI365 hỗ trợ sử dụng công cụ, tính năng phục vụ giao dịch; có quyền đóng góp ý kiến bằng thư, fax hoặc email.', 'Tự chịu trách nhiệm bảo mật và mọi hoạt động sử dụng dịch vụ của mình; thông báo kịp thời về hành vi sử dụng trái phép để cùng xử lý.', 'Cam kết thông tin cung cấp là chính xác và hoàn chỉnh; không sử dụng dịch vụ vào mục đích bất hợp pháp.'] }
      ] },
      { h: 'IX. Điều khoản áp dụng', items: [
        'Quy chế có hiệu lực kể từ ngày ký Quyết định ban hành. HOMI365 có quyền thay đổi Quy chế bằng cách thông báo trên website; việc tiếp tục sử dụng dịch vụ sau khi Quy chế sửa đổi được công bố đồng nghĩa với việc chấp nhận Quy chế sửa đổi.',
        'Thông tin liên lạc chính thức: Công ty TNHH Giải pháp Công nghệ Huy Giáp — Lô 18, Liền kề 114 phố Thanh Bình, Phường Mộ Lao, Quận Hà Đông, Hà Nội — Điện thoại 0982 466 668 — Email info@hgtechs.vn.'
      ] },
      { h: 'X. Điều khoản cam kết', items: ['Ban quản lý website và Khách hàng đồng ý cam kết thực hiện đúng các điều khoản trong nội dung bản Quy chế này.'] }
    ]
  },
  {
    id: 'van-chuyen-giao-nhan', title: 'Chính sách vận chuyển và giao nhận',
    intro: 'Nhằm thuận tiện cho khách hàng theo dõi mức phí và các quy định về giao hàng khi mua sản phẩm qua HOMI365, chúng tôi quy định như sau:',
    sections: [
      { h: '1. Phương thức giao hàng', items: ['HOMI365 hỗ trợ giao hàng toàn quốc; đơn hàng được giao đến tận địa chỉ Quý khách cung cấp khi đặt hàng thông qua các đơn vị vận chuyển do HOMI365 chỉ định tại từng thời điểm.'] },
      { h: '2. Quy định về mức phí giao hàng', items: ['Phí vận chuyển được tính theo giá của đơn vị vận chuyển. Trong một số chương trình khuyến mãi, phí giao hàng hoàn toàn miễn phí trên toàn quốc. Chi tiết mức phí của từng đơn hàng được thể hiện rõ tại trang hoàn tất đơn hàng.'] },
      { h: '3. Quy định về thời gian giao hàng', items: [
        { list: ['Nội thành Hà Nội và TP. Hồ Chí Minh: 1–2 ngày (không tính Chủ nhật, ngày lễ, Tết).', 'Ngoại thành Hà Nội/TP. Hồ Chí Minh và các tỉnh, thành phố khác: 3–4 ngày (không tính Chủ nhật, ngày lễ, Tết).'] },
        'Đây là thời gian giao hàng dự kiến, có thể thay đổi vì lý do ngoài ý muốn và sẽ được thông báo (nếu có). Quy định phân vùng nội/ngoại thành tuỳ thuộc từng đơn vị vận chuyển; chi tiết vui lòng liên hệ tổng đài chăm sóc khách hàng.'
      ] },
      { h: '4. Quy định chung về giao nhận', items: [
        { list: ['Phát sinh chậm trễ giao hàng, HOMI365 thông báo kịp thời; khách hàng có thể huỷ đơn trong trường hợp giao hàng trễ.', 'Hàng hoá bị hư hỏng do quá trình vận chuyển, HOMI365 đứng ra chịu trách nhiệm giải quyết cho khách hàng.', 'Đơn hàng số lượng lớn có quy trình giao khác biệt, bộ phận chăm sóc khách hàng liên hệ để báo giá giao hàng theo khoảng cách và nhà xe.', 'Khách hàng cung cấp đầy đủ, chính xác thông tin cần thiết; địa chỉ không rõ ràng sẽ được liên hệ hỗ trợ xử lý.', 'Đơn hàng giao tận nhà, trừ khu vực văn phòng hạn chế ra vào hoặc chung cư/cao tầng (giao tại cửa toà nhà).'] }
      ] },
      { h: '5. Phân định trách nhiệm với đơn vị vận chuyển', items: [
        'Bên cung ứng dịch vụ vận chuyển: kiểm tra xác thực hàng hoá, vận đơn; bảo đảm vận chuyển đầy đủ, an toàn, đúng thời hạn; giao hàng hoá, vận đơn nguyên vẹn cho người có quyền nhận; cung cấp đầy đủ chứng từ hàng hoá, có chữ ký hoặc hình chụp nhận hàng khi thu tiền; chịu chi phí chuyên chở; mua bảo hiểm trách nhiệm dân sự theo quy định.',
        'Bên thuê vận chuyển (HOMI365): yêu cầu chuyên chở đúng địa điểm, thời điểm đã thoả thuận; trả đủ cước phí đúng thời hạn; cung cấp thông tin cần thiết để bảo đảm an toàn hàng hoá.',
        'Trách nhiệm bồi thường: bên vận chuyển bồi thường nếu hàng hoá, vận đơn bị mất hoặc hư hỏng; bên thuê vận chuyển bồi thường nếu hàng hoá nguy hiểm không được đóng gói an toàn. Trường hợp bất khả kháng, bên vận chuyển không phải bồi thường trừ khi có thoả thuận khác; HOMI365 sẽ thông báo cụ thể tới khách hàng.',
        'Mọi thông tin xin liên hệ tổng đài chăm sóc khách hàng 0982 466 668, email info@hgtechs.vn — các ngày trong tuần từ 8:00 đến 21:00, trừ Tết âm lịch.'
      ] }
    ]
  },
  {
    id: 'thanh-toan', title: 'Chính sách thanh toán',
    sections: [
      { h: 'I. Xác lập và huỷ đơn đặt hàng', items: [
        'Xác lập đơn: khách hàng mở link giới thiệu, điền thông tin nhận hàng, xác thực số điện thoại và chọn phương thức thanh toán để tạo đơn đặt hàng.',
        'Huỷ đơn: khách hàng được quyền huỷ một phần hoặc toàn bộ đơn trước khi đơn được HOMI365 xác nhận (trừ sản phẩm có điều kiện đặc biệt) bằng cách liên hệ Trung tâm Chăm sóc khách hàng qua hotline 0982 466 668 hoặc email info@hgtechs.vn. Công ty xác nhận huỷ qua SMS, email hoặc cập nhật trạng thái đơn hàng.',
        'Để đảm bảo công bằng, HOMI365 có quyền áp dụng điều kiện hạn chế trong các chương trình khuyến mại (giới hạn số lượng, mục đích mua, không kinh doanh lại…). Công ty có quyền không xác nhận, từ chối, huỷ hoặc thu hồi ưu đãi của đơn hàng vi phạm Chính sách khuyến mại.',
        'Trường hợp đơn đã xác nhận bị huỷ một phần hoặc toàn bộ, số tiền đã thanh toán tương ứng được hoàn trả theo Chính sách đổi trả và hoàn tiền.'
      ] },
      { h: 'II. Các hình thức thanh toán', items: [
        { list: ['Chuyển khoản ngân hàng (VietQR): nội dung chuyển khoản ghi mã đơn hàng; đơn được xác nhận sau khi đối soát.', 'Thanh toán qua cổng thanh toán online (thẻ nội địa, thẻ quốc tế, ví điện tử); kết quả cập nhật ngay sau khi cổng phản hồi.'] },
        'Thông tin tài khoản nhận chuyển khoản được hiển thị tại bước thanh toán của từng đơn hàng.'
      ] },
      { h: 'III. Đổi trả hàng hoá/dịch vụ', items: [
        { list: ['Hàng hoá/dịch vụ chỉ được đổi sang hàng hoá/dịch vụ khác có giá trị tương đương.', 'HOMI365 chỉ chấp nhận trả lại khi lỗi thuộc về Công ty (sản phẩm lỗi, không sử dụng được).', 'Không thực hiện hoặc tạm hoãn đổi trả khi bị tác động bởi nguyên nhân khách quan: yêu cầu của chính quyền, phát hiện vi phạm trong thanh toán, thiên tai, dịch bệnh, lũ lụt.', 'Kiến nghị đổi trả qua hotline 0982 466 668 hoặc email info@hgtechs.vn; thời gian xử lý 03–05 ngày làm việc kể từ ngày nhận kiến nghị.'] }
      ] },
      { h: 'IV. Hoàn tiền và thời gian hoàn tiền dự kiến', items: [
        { list: ['Hoàn vào tài khoản ngân hàng với đơn thanh toán bằng chuyển khoản: 05–07 ngày làm việc.', 'Hoàn qua cổng thanh toán/ví điện tử với đơn thanh toán qua cổng: 03–05 ngày làm việc.', 'Thẻ Visa/Master/JCB: ngân hàng chuyển hoàn trong 1–3 tuần làm việc tuỳ chính sách từng ngân hàng.'] },
        'Ngày làm việc không bao gồm thứ Bảy, Chủ nhật và ngày lễ. Quá thời gian trên chưa nhận được tiền hoàn, vui lòng liên hệ ngân hàng phát hành thẻ hoặc bộ phận Chăm sóc khách hàng. Các chính sách và điều khoản có thể được thay đổi trong tương lai.'
      ] }
    ]
  },
  {
    id: 'bao-mat-thong-tin', title: 'Chính sách bảo mật thông tin',
    sections: [
      { h: 'A. Bảo mật thanh toán', items: [
        'Tất cả thông tin giao dịch qua thẻ nội địa hoặc thẻ quốc tế trên website/ứng dụng HOMI365 đều được bảo mật bằng mã hoá. Khi thanh toán trực tuyến, khách hàng lưu ý: chỉ thanh toán trên website/ứng dụng có chứng chỉ an toàn; không cho người khác mượn thẻ; kiểm tra thẻ thường xuyên và thông báo ngay khi phát sinh giao dịch ngoài ý muốn.',
        'Hệ thống thanh toán thẻ do các đối tác cổng thanh toán được cấp phép tại Việt Nam cung cấp, tuân thủ tiêu chuẩn bảo mật ngành: giao thức SSL/TLS, chứng nhận PCI DSS Level 1 và quy định của Ngân hàng Nhà nước. HOMI365 chỉ lưu mã đơn hàng, mã giao dịch và tên ngân hàng; thông tin thẻ do đối tác cổng thanh toán lưu trữ và bảo mật.',
        'Khi phát hiện thông tin thanh toán bị sử dụng sai mục đích, khách hàng gửi khiếu nại qua tổng đài 0982 466 668 hoặc email info@hgtechs.vn kèm chứng cứ; HOMI365 hỗ trợ giải quyết hoặc đền bù nếu lỗi do HOMI365. Trường hợp ngoài thẩm quyền, HOMI365 đề nghị khách hàng đưa sự việc tới cơ quan nhà nước có thẩm quyền.'
      ] },
      { h: 'B. Bảo mật thông tin cá nhân', items: [
        'Chính sách này do Công ty TNHH Giải pháp Công nghệ Huy Giáp (HGTECHS CO.,LTD) ban hành. Chúng tôi tôn trọng tính riêng tư của dữ liệu cá nhân, cam kết bảo mật và chỉ thu thập những thông tin cần thiết.'
      ] },
      { h: '1. Mục đích và phạm vi thu thập', items: [
        'Thu thập nhằm quản lý khách hàng liên quan đến hoạt động mua sản phẩm, hỗ trợ khách hàng và kịp thời xử lý các tình huống phát sinh. Bằng việc cung cấp dữ liệu, khách hàng đồng ý dữ liệu được thu thập, sử dụng theo Chính sách này.',
        'Dữ liệu thu thập gồm: họ tên, ngày sinh (nếu có), giới tính, số điện thoại, email, địa chỉ giao hàng, thông tin xuất hoá đơn, cookie truy cập website/ứng dụng — qua các kênh website, ứng dụng, fanpage, email hoặc cuộc gọi đóng góp ý kiến.'
      ] },
      { h: '2. Phạm vi sử dụng', items: [{ list: ['Xác nhận đặt hàng, giao hàng hoặc các dịch vụ khách hàng yêu cầu.', 'Chăm sóc khách hàng, cải thiện chất lượng dịch vụ bán hàng.', 'Truyền thông, quảng cáo thông tin của HOMI365.'] }] },
      { h: '3. Thời gian lưu trữ', items: ['Dữ liệu cá nhân được lưu trữ từ khi khách hàng cung cấp cho đến khi có yêu cầu huỷ bỏ hoặc khách hàng tự đăng nhập và huỷ bỏ; các trường hợp còn lại được lưu trữ và bảo mật vĩnh viễn.'] },
      { h: '4. Đơn vị có thể tiếp cận dữ liệu', items: [
        'Chúng tôi cố gắng chỉ chia sẻ dữ liệu đã tổng hợp hoặc ẩn danh. Trong các trường hợp thật sự cần thiết, dữ liệu cá nhân có thể được chia sẻ với:',
        { list: ['Bên cung cấp dịch vụ của chúng tôi (logistics và giao hàng, gửi tin nhắn khuyến mại, phân tích dữ liệu, chăm sóc khách hàng) để thay mặt chúng tôi xử lý dữ liệu theo mục đích tại mục 1 và 2.', 'Cơ quan nhà nước và cơ quan quản lý khi được yêu cầu bởi pháp luật, toà án hoặc lệnh của toà án.'] }
      ] },
      { h: '5. Tiếp cận và chỉnh sửa dữ liệu', items: ['Khách hàng có thể đăng nhập "Tài khoản của tôi / Thông tin cá nhân" để kiểm tra, cập nhật, chỉnh sửa hoặc huỷ bỏ dữ liệu cá nhân, hoặc liên hệ tổng đài 0982 466 668 để được hỗ trợ.'] },
      { h: '6. Cách HOMI365 bảo vệ dữ liệu', items: [{ list: ['Bảo mật dữ liệu bằng các công cụ, giải pháp tốt nhất; chỉ nhân viên, đại diện và nhà cung cấp dịch vụ được truy cập trên cơ sở cần phải biết.', 'Trường hợp máy chủ bị tấn công dẫn đến mất mát dữ liệu, chúng tôi thông báo cho cơ quan chức năng điều tra và thông báo cho khách hàng.', 'Thông tin thanh toán được các bên cung cấp dịch vụ thanh toán bảo mật bằng SSL/TLS.'] }] },
      { h: '7. Quyền lợi của khách hàng', items: [{ list: ['Kiểm tra, cập nhật, điều chỉnh hoặc huỷ bỏ dữ liệu cá nhân bất kỳ lúc nào.', 'Từ chối nhận thông tin khuyến mại, quảng cáo, email, tin nhắn, cuộc gọi qua tổng đài 0982 466 668.', 'Khiếu nại khi dữ liệu bị sử dụng sai mục đích; chúng tôi phản hồi muộn nhất trong 48 giờ làm việc.'] }] },
      { h: '8. Thay đổi chính sách', items: ['Chúng tôi có quyền thay đổi nội dung Chính sách để phù hợp nhu cầu, phản hồi của khách hàng và yêu cầu pháp luật; ngày cập nhật được ghi ở phần đầu. Khách hàng tiếp tục sử dụng dịch vụ được hiểu là đã đồng ý với Chính sách cập nhật.'] },
      { h: '9. Đơn vị thu thập và quản lý thông tin', items: ['Công ty TNHH Giải pháp Công nghệ Huy Giáp chịu toàn bộ trách nhiệm về việc thu thập và quản lý dữ liệu cá nhân. Địa chỉ: Liền kề 18, 114 Đường Thanh Bình, Phường Mộ Lao, Quận Hà Đông, TP. Hà Nội. Tổng đài chăm sóc khách hàng, giải quyết khiếu nại: 0982 466 668 — tất cả các ngày trong tuần từ 8:00 đến 21:00, trừ Tết âm lịch.'] }
    ]
  },
  {
    id: 'kiem-hang', title: 'Chính sách kiểm hàng',
    sections: [
      { h: 'Định nghĩa', items: ['Kiểm hàng là việc kiểm tra và so sánh các sản phẩm nhận được trong kiện hàng HOMI365 gửi với các sản phẩm trong đơn hàng khách yêu cầu.'] },
      { h: 'Thời điểm kiểm hàng', items: ['HOMI365 chấp nhận cho khách hàng đồng kiểm với nhân viên giao hàng tại thời điểm nhận hàng; không hỗ trợ thử hàng. Sau khi nhận hàng, nếu kiểm lại phát hiện sai, khách hàng liên lạc bộ phận chăm sóc khách hàng để được hỗ trợ đổi trả. Quý khách nên quay video lúc mở thùng hàng để đối chiếu khi cần.'] },
      { h: 'Phạm vi kiểm tra hàng hoá', items: [{ list: ['Kiểm tra sản phẩm thực nhận, đối chiếu với sản phẩm đã đặt theo ảnh mẫu, mã sản phẩm, kích thước, màu sắc, chất liệu.', 'Tuyệt đối không bóc, mở các hộp sản phẩm có tem niêm phong, tem đảm bảo.', 'Không cào lấy mã các sản phẩm có tích điểm, đổi quà.'] }] },
      { h: 'Xử lý khi hàng hoá không đúng đơn đặt hàng', items: [
        'Khi đồng kiểm phát hiện sản phẩm không như đơn hàng, liên hệ hotline 0982 466 668 hoặc email info@hgtechs.vn để bộ phận chăm sóc khách hàng xác nhận lại đơn.',
        { list: ['HOMI365 đóng sai đơn: khách có thể không nhận hàng, không thanh toán; nếu đã thanh toán, khách có thể yêu cầu gửi lại đơn mới hoặc được hoàn tiền trong thời gian sớm nhất.', 'HOMI365 đóng đúng đơn nhưng khách thay đổi nhu cầu: áp dụng chính sách đổi trả hàng hoá; khách thanh toán chi phí giao hàng (nếu có).'] }
      ] },
      { h: 'Kênh tiếp nhận khiếu nại', items: ['Email info@hgtechs.vn hoặc hotline 0982 466 668.'] }
    ]
  }
];
