import React, { useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Rate, Modal, Input, Divider, Popover, Spin, message } from 'antd';
import {
  EnvironmentOutlined, ArrowRightOutlined, SearchOutlined,
  ClockCircleOutlined, CarOutlined, StarFilled,
  CompassOutlined, CameraOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FreeMap from '../components/FreeMap';

const { Title, Paragraph, Text } = Typography;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';

// Style tiện ích dùng chung cho các đoạn văn blog để code gọn gàng hơn
export const blogContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  color: '#444',
  textAlign: 'justify',
  lineHeight: '1.8',
  fontSize: '0.95rem'
};

export const blogHeadingStyle = {
  fontWeight: 'bold',
  fontSize: '1.25rem',
  color: '#1a1a1a',
  borderLeft: '4px solid #c9a961',
  paddingLeft: '12px',
  marginTop: '20px',
  marginBottom: '4px'
};

// ── Data tĩnh (LOCAL_GUIDES_DATA) chứa blog chi tiết dạng JSX cho các địa điểm TP.HCM ──
export const LOCAL_GUIDES_DATA = [
  { id: 'g1', titleKey: 'attractionsPage.hoian_title', categoryKey: 'explore.catHeritage', descKey: 'attractionsPage.hoian_desc', fullContentKey: 'attractionsPage.hoian_full', img: 'https://images.unsplash.com/photo-1679033932050-831ace7a226f?w=800&q=80', distance: '5 km', durationKey: 'attractionsPage.hoian_duration', rating: 4.9, tagsKey: 'attractionsPage.hoian_tags', mapUrl: '', location: 'Đà Nẵng', lat: 15.8801, lng: 108.3380 },
  { id: 'g2', titleKey: 'attractionsPage.bana_title', categoryKey: 'explore.catEntertainment', descKey: 'attractionsPage.bana_desc', fullContentKey: 'attractionsPage.bana_full', img: 'https://images.unsplash.com/photo-1663684591502-93887202a863?w=800&q=80', distance: '25 km', durationKey: 'attractionsPage.bana_duration', rating: 4.8, tagsKey: 'attractionsPage.bana_tags', mapUrl: '', location: 'Đà Nẵng', lat: 15.9961, lng: 107.9880 },
  { id: 'g3', titleKey: 'attractionsPage.mykhe_title', categoryKey: 'explore.catNature', descKey: 'attractionsPage.mykhe_desc', fullContentKey: 'attractionsPage.mykhe_full', img: 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad?w=800&q=80', distance: '1 km', durationKey: 'attractionsPage.mykhe_duration', rating: 4.7, tagsKey: 'attractionsPage.mykhe_tags', mapUrl: '', location: 'Đà Nẵng', lat: 16.0610, lng: 108.2483 },
  { id: 'g4', titleKey: 'attractionsPage.marble_title', categoryKey: 'explore.catSpiritual', descKey: 'attractionsPage.marble_desc', fullContentKey: 'attractionsPage.marble_full', img: 'https://images.unsplash.com/photo-1699195139838-1cc3516aece2?w=800&q=80', distance: '8 km', durationKey: 'attractionsPage.marble_duration', rating: 4.6, tagsKey: 'attractionsPage.marble_tags', mapUrl: '', location: 'Đà Nẵng', lat: 16.0028, lng: 108.2618 },
  
  // HCM 1: Chợ Bến Thành
  {
    id: 'g_hcm1',
    titleKey: null,
    title_vi: 'Chợ Bến Thành',
    title_en: 'Ben Thanh Market',
    categoryKey: 'explore.catHeritage',
    descKey: null,
    desc_vi: 'Biểu tượng lịch sử lâu đời, nơi hội tụ tinh hoa ẩm thực Sài Gòn và là điểm mua sắm sầm uất.',
    desc_en: 'A historical icon and bustling market, hub of Saigon street food and shopping.',
    img: 'https://images.unsplash.com/photo-1680783307371-749c26e0f5c3?w=800&q=80',
    distance: '1.5 km',
    duration_vi: 'Vài giờ',
    duration_en: 'A few hours',
    rating: 4.6,
    tags_vi: ['Mua sắm', 'Ẩm thực', 'Lịch sử'],
    tags_en: ['Shopping', 'Cuisine', 'History'],
    mapUrl: '',
    location: 'Hồ Chí Minh',
    lat: 10.7725,
    lng: 106.6980,
    content_vi: (
      <div style={blogContainerStyle}>
        <p>Nếu Hà Nội tự hào có chợ Đồng Xuân nghìn năm văn hiến thì Sài Gòn cũng kiêu hãnh sở hữu <strong>Chợ Bến Thành</strong> - khu chợ sầm uất mang đậm nét văn hóa đặc trưng nhất của người dân miền Nam. Trải qua bao biến động lịch sử, ngôi chợ trăm tuổi này vẫn đứng sừng sững như một nhân chứng lịch sử kiêu hãnh, một biểu tượng trường tồn của thành phố mang tên Bác.</p>
        
        <h4 style={blogHeadingStyle}>Vài nét về lịch sử thăng trầm của Chợ Bến Thành</h4>
        <p>Ngôi chợ có nguồn gốc từ trước khi người Pháp đặt chân tới đất Gia Định. Ban đầu, chợ nằm ven sông Bến Nghé, cạnh một bến sông gần thành Gia Định nên được gọi là Chợ Bến Thành. Đến năm 1912, người Pháp đã cho xây dựng lại chợ tại vị trí hiện tại và khánh thành vào năm 1914. Trải qua hơn một thế kỷ hoạt động liên tục, chợ Bến Thành không chỉ là nơi buôn bán giao thương mà còn là điểm giao thoa văn hóa giữa Sài Gòn xưa và nay.</p>
        
        <h4 style={blogHeadingStyle}>Kiến trúc bốn cửa độc đáo và Tháp đồng hồ biểu tượng</h4>
        <p>Điểm nhấn kiến trúc nổi tiếng nhất toàn thế giới của Chợ Bến Thành chính là ngôi tháp đồng hồ ba mặt nằm sừng sững tại Cửa Nam - lối vào chính của chợ. Ngôi chợ được thiết kế vô cùng khoa học với 4 cửa chính quay về 4 hướng đường huyết mạch của Quận 1, mỗi cửa chuyên kinh doanh các mặt hàng đặc trưng khác nhau: Cửa Nam hướng ra quảng trường Quách Thị Trang chuyên quần áo, vải vóc; Cửa Bắc hướng ra Lê Thánh Tôn rực rỡ sắc hoa tươi và trái cây; Cửa Đông hướng ra Phan Bội Châu đầy mứt kẹo ngon lành; và Cửa Tây hướng ra Phan Chu Trinh nhộn nhịp giày dép, đồ lưu niệm.</p>
        
        <h4 style={blogHeadingStyle}>Trải nghiệm ẩm thực phong phú khó lòng bỏ qua</h4>
        <p>Khu ẩm thực bên trong Chợ Bến Thành được ví như "bản đồ thu nhỏ" của ẩm thực Việt Nam. Đi vào đây, bạn sẽ bị cuốn hút bởi hương thơm ngào ngạt tỏa ra từ các gian hàng. Hãy thử một tô hủ tiếu Nam Vang nước dùng thanh ngọt, bánh xèo chiên giòn tan đầy ắp tôm thịt, bún mắm đậm đà hương vị miền Tây hay một ly chè Sài Gòn ngọt mát lịm để xua tan đi cái nóng oi bức của thành phố.</p>
        
        <h4 style={blogHeadingStyle}>Kinh nghiệm mua sắm làm quà cho du khách</h4>
        <p>Chợ Bến Thành là kho báu của các loại đồ thủ công mỹ nghệ như tranh sơn mài, đồ gốm sứ, đồ da handmade hay các đặc sản chè, cà phê hạt xay nguyên chất cực thơm ngon. Vì đây là chợ du lịch sầm uất, các bạn du khách nên thương lượng giá cả một cách cởi mở, thân thiện với các cô chú tiểu thương để có những trải nghiệm mua sắm vui vẻ và rinh về những món đồ ưng ý nhất.</p>
      </div>
    ),
    content_en: (
      <div style={blogContainerStyle}>
        <p>While Hanoi takes pride in Dong Xuan Market, Saigon is equally proud of <strong>Ben Thanh Market</strong> - a bustling commercial hub embodying the rich Southern Vietnamese lifestyle. Surviving multiple historical eras, this century-old market remains an eternal symbol of Saigon.</p>
        
        <h4 style={blogHeadingStyle}>The Historic Evolution of Ben Thanh Market</h4>
        <p>The market's history dates back to the early days of Gia Dinh land. Originally situated on the banks of the Ben Nghe River near the Gia Dinh Citadel, it was named "Ben Thanh" (Harbor Gate). In 1912, the French rebuilt the market at its current location and officially opened it in 1914. Operating for over a century, Ben Thanh is not just a marketplace but a historic meeting point of old and new Saigon.</p>
        
        <h4 style={blogHeadingStyle}>Iconic Clock Tower and Cross-Shaped Architecture</h4>
        <p>The main visual attraction is the three-sided clock tower standing proudly at the South Gate. The market forms a rectangular layout with 4 main gates facing major commercial streets: South Gate facing Quach Thi Trang Square (clothing and textiles), North Gate on Le Thánh Tôn (fresh flowers and fruits), East Gate on Phan Bội Châu (sweets and jams), and West Gate on Phan Chu Trinh (shoes and handicrafts).</p>
        
        <h4 style={blogHeadingStyle}>Dive into Saigon Street Food Paradise</h4>
        <p>Walking into the food court of Ben Thanh Market is like embarking on a rich culinary adventure. It features iconic Southern dishes such as savory Hu Tieu, crispy gold Banh Xeo, rich Bun Mam, and colorful Saigon sweet soup bowls served with shaved ice.</p>
        
        <h4 style={blogHeadingStyle}>Smart Shopping Tips for First-Time Visitors</h4>
        <p>Ben Thanh Market is the ultimate place to shop for local souvenirs, lacquerware paintings, conical hats, and premium roasted coffee beans. As a popular tourist hub, we recommend bargaining gently and cheerfully to secure the best deals.</p>
      </div>
    )
  },

  // HCM 2: Dinh Độc Lập
  {
    id: 'g_hcm2',
    titleKey: null,
    title_vi: 'Dinh Độc Lập',
    title_en: 'Independence Palace',
    categoryKey: 'explore.catHeritage',
    descKey: null,
    desc_vi: 'Chứng nhân lịch sử kiêu hùng, một kiệt tác kiến trúc kết hợp hài hòa giữa nét hiện đại và triết lý Á Đông.',
    desc_en: 'A historic witness and architectural masterpiece combining modern style and Eastern philosophy.',
    img: 'https://images.unsplash.com/photo-1605884952010-b98967812e96?w=800&q=80',
    distance: '2.0 km',
    duration_vi: '2 - 3 giờ',
    duration_en: '2 - 3 hours',
    rating: 4.8,
    tags_vi: ['Lịch sử', 'Kiến trúc', 'Di tích'],
    tags_en: ['History', 'Architecture', 'Heritage'],
    mapUrl: '',
    location: 'Hồ Chí Minh',
    lat: 10.7770,
    lng: 106.6953,
    content_vi: (
      <div style={blogContainerStyle}>
        <p>Nằm yên bình dưới những tán cây cổ thụ xanh mát giữa trung tâm Quận 1, <strong>Dinh Độc Lập</strong> (hay còn gọi là Dinh Thống Nhất) là một trong những công trình kiến trúc lịch sử thiêng liêng nhất Việt Nam. Đây là nơi hội tụ hào khí lịch sử, chứng kiến sự kết thúc hoàn toàn của cuộc kháng chiến lâu dài và mở ra kỷ nguyên độc lập cho đất nước.</p>
        
        <h4 style={blogHeadingStyle}>Nhân chứng lịch sử của thời khắc thống nhất</h4>
        <p>Dinh Độc Lập từng là nơi cư trú và làm việc của Tổng thống Việt Nam Cộng hòa. Vào thời khắc lịch sử trưa ngày 30 tháng 4 năm 1975, chiếc xe tăng mang số hiệu 390 của quân giải phóng đã húc đổ cánh cổng sắt kiên cố của dinh, đánh dấu sự thống nhất hoàn toàn của non sông bờ cõi sau nhiều năm chia cắt.</p>
        
        <h4 style={blogHeadingStyle}>Kiệt tác kiến trúc Á Đông hiện đại và Triết lý sâu sắc</h4>
        <p>Dinh được thiết kế bởi kiến trúc sư tài hoa Ngô Viết Thụ - người Việt Nam duy nhất đạt giải Khôi nguyên La Mã. Công trình thể hiện sự kết hợp vô cùng hài hòa giữa đường nét vuông vức, tinh gọn của kiến trúc hiện đại phương Tây và các chi tiết mang triết lý truyền thống phương Đông. Bố cục mặt bằng dinh được tạo hình thành chữ "CÁT" (mang ý nghĩa tốt lành), mặt tiền dinh nổi bật với hệ thống lam bê tông cách điệu từ những đốt tre thanh nhã. Các gian phòng lớn bên trong như phòng khánh tiết, phòng đại yến được trang hoàng lộng lẫy và vô cùng uy nghiêm.</p>
        
        <h4 style={blogHeadingStyle}>Khám phá căn hầm trú ẩn kiên cố thời chiến</h4>
        <p>Hành trình khám phá Dinh Độc Lập sẽ đưa du khách đi sâu xuống khu hầm trú ẩn ngầm. Đây là một hệ thống phòng thủ kiên cố làm bằng bê tông cốt thép dày, được thiết kế để chống lại bom đạn hạng nặng. Bên trong hầm vẫn lưu giữ nguyên vẹn các bản đồ quân sự lớn, phòng thông tin liên lạc cổ kính và chiếc xe Jeep tác chiến lịch sử.</p>
        
        <h4 style={blogHeadingStyle}>Mẹo nhỏ khi ghé thăm Dinh</h4>
        <p>Bao quanh Dinh là một bãi cỏ xanh hình oval khổng lồ và khuôn viên xanh rợp mát bóng cây cổ thụ. Bạn nên dành khoảng nửa ngày để đi dạo, chụp ảnh cùng hai chiếc xe tăng lịch sử mang số hiệu 390 và 843 đặt trên bãi cỏ, đồng thời tận hưởng không gian trong lành tĩnh lặng tách biệt khỏi sự ồn ào đô thị.</p>
      </div>
    ),
    content_en: (
      <div style={blogContainerStyle}>
        <p>Nestled under lush green canopies in District 1, the <strong>Independence Palace</strong> (also known as Reunification Palace) is one of the most sacred historical landmarks in Vietnam. This building witnessed the official end of the Vietnam War, marking a new era of peace and independence.</p>
        
        <h4 style={blogHeadingStyle}>The Stage of Modern Vietnamese History</h4>
        <p>The palace served as the home and workplace of the President of South Vietnam during the war. At noon on April 30, 1975, tank number 390 crashed through the palace gates, hoisting the revolutionary flag on the rooftop, symbolizing the official reunification of the nation.</p>
        
        <h4 style={blogHeadingStyle}>An Eastern Philosophical Masterpiece</h4>
        <p>Designed by the Roman Prize winner architect Ngo Viet Thu, the palace is a perfect mix of Western modernist geometry and traditional Asian philosophy. The floor plan forms the Chinese character for "Good Fortune", and the facade features elegant concrete sunshades styled like bamboo segments. Important halls like the Reception Hall and Banquet Hall are decorated with solemn and regal aesthetics.</p>
        
        <h4 style={blogHeadingStyle}>Explore the Subterranean Military Bunker</h4>
        <p>The most fascinating part for adventurers is the underground bunker system. Designed to withstand heavy bombing, this bunker houses command center rooms, maps, vintage radio broadcasting equipment, and transmitters preserved in pristine condition.</p>
        
        <h4 style={blogHeadingStyle}>A Serene Oasis in a Bustling City</h4>
        <p>Surrounding the palace is a massive oval lawn and a park filled with century-old trees. Walking under the cool shade, looking at the water fountain and the historical tanks displayed in the yard offers a quiet moment of reflection away from the city's frantic traffic.</p>
      </div>
    )
  },

  // HCM 3: Landmark 81
  {
    id: 'g_hcm3',
    titleKey: null,
    title_vi: 'Tòa nhà Landmark 81',
    title_en: 'Landmark 81 Building',
    categoryKey: 'explore.catEntertainment',
    descKey: null,
    desc_vi: 'Biểu tượng mới của sự thịnh vượng, nó sở hữu đài quan sát Skyview cao nhất Đông Nam Á cùng nhiều khu mua sắm sầm uất.',
    desc_en: 'A new icon of prosperity, featuring the highest Skyview observatory in SE Asia and luxury shopping.',
    img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    distance: '5.0 km',
    duration_vi: 'Vài giờ',
    duration_en: 'A few hours',
    rating: 4.9,
    tags_vi: ['Hiện đại', 'Mua sắm', 'Ngắm cảnh'],
    tags_en: ['Modern', 'Shopping', 'Scenic'],
    mapUrl: '',
    location: 'Hồ Chí Minh',
    lat: 10.7948,
    lng: 106.7218,
    content_vi: (
      <div style={blogContainerStyle}>
        <p>Nếu bạn muốn nhìn ngắm một góc độ hoàn toàn mới, hiện đại và xa hoa của Thành phố Hồ Chí Minh thì hãy đến với <strong>Landmark 81</strong>. Đứng kiêu hãnh bên bờ sông Sài Gòn uốn lượn, tòa nhà chọc trời này không chỉ nắm giữ danh hiệu cao nhất Việt Nam mà còn là biểu tượng rực rỡ của sự thịnh vượng, khát vọng vươn mình ra biển lớn của thế giới.</p>
        
        <h4 style={blogHeadingStyle}>Kiến trúc bó tre truyền thống độc đáo</h4>
        <p>Landmark 81 cao kỷ lục 461.3 mét với 81 tầng nổi. Thiết kế của tòa nhà được lấy cảm hứng từ hình ảnh "bó tre" truyền thống - biểu tượng vô giá của người Việt Nam đại diện cho sự đoàn kết, kiên cường bất khuất. Những khối tháp nhỏ xếp chồng đan xen vươn thẳng lên trời tạo nên nét kiến trúc vô cùng hiện đại nhưng vẫn mang đậm bản sắc văn hóa Việt.</p>
        
        <h4 style={blogHeadingStyle}>Chiêm ngưỡng toàn cảnh thành phố từ Đài quan sát Skyview</h4>
        <p>Đến với Landmark 81, du khách không thể bỏ lỡ cơ hội khám phá đài quan sát Skyview nằm ở ba tầng cao nhất 79, 80 và 81. Ở độ cao gần 400 mét, qua những tấm kính cường lực lớn, bạn sẽ ngắm trọn vẹn bức tranh Sài Gòn phồn hoa chuyển mình tuyệt đẹp. Đặc biệt, cầu kính SkyTouch nhô ra ngoài không trung sẽ đem lại cho những ai đam mê mạo hiểm cảm giác như đang dạo bước trên mây.</p>
        
        <h4 style={blogHeadingStyle}>Tổ hợp vui chơi giải trí và ẩm thực đẳng cấp</h4>
        <p>Vincom Center Landmark 81 dưới chân tòa nhà là một thiên đường mua sắm đích thực với hàng trăm thương hiệu xa xỉ. Nơi đây sở hữu sân băng tự nhiên Vincom Ice Rink lớn nhất Việt Nam rộng hơn 2000 mét vuông, rạp chiếu phim CGV IMAX màn hình khổng lồ, và vô vàn nhà hàng ẩm thực Á - Âu sang trọng nhìn ra công viên ven sông xanh mướt.</p>
        
        <h4 style={blogHeadingStyle}>Thời điểm ngắm cảnh hoàn hảo</h4>
        <p>Thời điểm lý tưởng nhất để lên đài quan sát là từ 16h30 đến 18h00. Bạn sẽ được chiêm ngưỡng khoảnh khắc hoàng hôn buông xuống rực rỡ trên dòng sông Sài Gòn trước khi cả thành phố rực rỡ thắp lên những ánh đèn lung linh tuyệt đẹp tựa dải ngân hà.</p>
      </div>
    ),
    content_en: (
      <div style={blogContainerStyle}>
        <p>Representing a young, dynamic, and ultra-modern Saigon is the iconic skyscraper <strong>Landmark 81</strong>. Rising proudly along the Saigon River, it is not only the tallest building in Vietnam but also a proud symbol of the nation's international aspiration and technological growth.</p>
        
        <h4 style={blogHeadingStyle}>Bamboo Bundle Design Honoring Vietnamese Roots</h4>
        <p>Standing at a record height of 461.3 meters with 81 stories, the tower features a stunning structural design inspired by the traditional Vietnamese "bamboo bundle". The segments of bamboo rising together symbolize strength, resilience, and national solidarity reaching for the sky.</p>
        
        <h4 style={blogHeadingStyle}>Soak in 360-Degree Views at Skyview Observatory</h4>
        <p>The ultimate experience at Landmark 81 is visiting the Skyview Observatory spanning floors 79, 80, and 81. At nearly 400 meters high, you can view the entire Ho Chi Minh City skyline hugging the Saigon River. Thrill-seekers can try walking on the "SkyTouch" open-air glass bridge suspended high in the clouds.</p>
        
        <h4 style={blogHeadingStyle}>A Luxury Shopping and Entertainment Hub</h4>
        <p>The bustling Vincom Center shopping mall at the base of the tower gathers global luxury fashion brands. Landmark 81 also houses Vincom Ice Rink, the largest natural ice rink in Vietnam (over 2,000 sqm), a premium CGV IMAX cinema, and a wide collection of upscale international dining spots.</p>
      </div>
    )
  },

  // HCM 4: Phố Đi Bộ Nguyễn Huệ
  {
    id: 'g_hcm4',
    titleKey: null,
    title_vi: 'Phố đi bộ Nguyễn Huệ',
    title_en: 'Nguyen Hue Walking Street',
    categoryKey: 'explore.catEntertainment',
    descKey: null,
    desc_vi: 'Trái tim sôi động của Sài Gòn về đêm, nơi giao lưu văn hóa và ngắm nhìn nhịp sống hiện đại.',
    desc_en: 'The vibrant heart of Saigon at night, a hub of cultural exchange and modern city life.',
    img: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&q=80',
    distance: '1.2 km',
    duration_vi: '1 - 2 giờ',
    duration_en: '1 - 2 hours',
    rating: 4.7,
    tags_vi: ['Sôi động', 'Đi dạo', 'Ẩm thực'],
    tags_en: ['Vibrant', 'Walking', 'Cuisine'],
    mapUrl: '',
    location: 'Hồ Chí Minh',
    lat: 10.7740,
    lng: 106.7038,
    content_vi: (
      <div style={blogContainerStyle}>
        <p>Nếu có ai đó hỏi "Đi đâu để thấy một Sài Gòn trẻ trung và tràn đầy nhựa sống nhất?", câu trả lời chắc chắn là <strong>Phố Đi Bộ Nguyễn Huệ</strong>. Con đường quảng trường đi bộ lát đá hoa cương hiện đại bậc nhất Việt Nam này là nơi giao thoa tuyệt vời của nhịp sống đô thị, nghệ thuật đường phố và ẩm thực đường phố đa sắc màu.</p>
        
        <h4 style={blogHeadingStyle}>Đại lộ lịch sử chuyển mình hiện đại</h4>
        <p>Đại lộ Nguyễn Huệ kéo dài hơn 670 mét bắt đầu từ tòa nhà UBND Thành phố mang kiến trúc Pháp cổ kính đến tận bến Bạch Đằng lộng gió. Ban ngày con phố trông lịch lãm, yên bình, nhưng khi hoàng hôn buông xuống, nó thực sự lột xác khoác lên mình vẻ ngoài nhộn nhịp, lung linh ánh đèn đầy lôi cuốn.</p>
        
        <h4 style={blogHeadingStyle}>Sân khấu biểu diễn nghệ thuật đường phố tự phát sôi động</h4>
        <p>Mỗi tối cuối tuần, phố đi bộ Nguyễn Huệ cấm hoàn toàn xe cộ để nhường không gian cho dòng người tấp nập. Dưới làn nước phun nghệ thuật lấp lánh ánh sáng nhiều màu, bạn sẽ bắt gặp những vòng tròn đám đông xem các bạn trẻ say sưa hát acoustic, chơi nhạc cụ mộc mạc hay biểu diễn những bước nhảy hiện đại đầy năng lượng.</p>
        
        <h4 style={blogHeadingStyle}>Check-in tại Chung cư 42 Nguyễn Huệ huyền thoại</h4>
        <p>Đối diện quảng trường là khu chung cư số 42 Nguyễn Huệ - công trình mang tính biểu tượng nổi tiếng trên mạng xã hội toàn cầu. Nhìn từ xa, tòa nhà cổ này trông giống như một chiếc hộp khổng lồ chứa hàng chục ô màu rực rỡ, mỗi ô là một quán cà phê trang trí xinh xắn. Ngồi trên ban công một quán cà phê nhỏ, nhâm nhi ly trà đào, ngắm nhìn nhịp sống hối hả trôi chảy bên dưới là trải nghiệm vô cùng thú vị.</p>
        
        <h4 style={blogHeadingStyle}>Thiên đường ẩm thực đường phố đủ vị ngọt béo</h4>
        <p>Bên cạnh các thương hiệu trà sữa nổi tiếng dọc hai bên đường, bạn còn có thể thưởng thức những món ăn vặt "kinh điển" của giới trẻ Sài Gòn như bánh tráng nướng trứng thơm nức, kem bơ béo ngậy hay những que xiên chiên nóng hổi được bán quanh khu phố.</p>
      </div>
    ),
    content_en: (
      <div style={blogContainerStyle}>
        <p>To feel the youth, rhythm, and modern energy of Saigon at night, head straight to <strong>Nguyen Hue Walking Street</strong>. This granite-paved walking plaza, the most modern in Vietnam, is the perfect stage for music, lights, and local urban life.</p>
        
        <h4 style={blogHeadingStyle}>The Historic Boulevard of District 1</h4>
        <p>Nguyen Hue Boulevard stretches 670 meters from the historic City Hall to the Bach Dang Wharf park along the Saigon River. By day, the street is a calm plaza, but as dusk falls, it turns into a vibrant, neon-lit outdoor festival theater.</p>
        
        <h4 style={blogHeadingStyle}>A Stage for Street Art and Music</h4>
        <p>At night, colorful music fountains light up the boulevard. Walking along the street, you will find acoustic band circles, street dancers performing modern choreography, and large cultural stages constructed during weekend events and national festivals.</p>
        
        <h4 style={blogHeadingStyle}>Check-in at the Famous 42 Nguyen Hue Cafe Apartment</h4>
        <p>Standing tall on the boulevard is the old apartment block at No. 42. This building looks like a giant Rubik's cube filled with independent coffee houses, cozy tea rooms, and fashion boutiques. Sitting on a high balcony with a cup of Vietnamese drip coffee watching the crowds walk below is a signature Saigon youth experience.</p>
      </div>
    )
  },

  // HCM 5: Bưu điện Thành phố
  {
    id: 'g_hcm5',
    titleKey: null,
    title_vi: 'Bưu điện Thành phố Hồ Chí Minh',
    title_en: 'Saigon Central Post Office',
    categoryKey: 'explore.catHeritage',
    descKey: null,
    desc_vi: 'Kiệt tác kiến trúc Phục Hưng Pháp cổ kính, điểm check-in lịch sử tuyệt đẹp nằm cạnh Nhà thờ Đức Bà.',
    desc_en: 'A French Renaissance masterpiece and stunning historic landmark next to Notre Dame Cathedral.',
    img: 'https://images.unsplash.com/photo-1571867424488-4565932edb41?w=800&q=80',
    distance: '2.2 km',
    duration_vi: '1 giờ',
    duration_en: '1 hour',
    rating: 4.8,
    tags_vi: ['Kiến trúc', 'Lịch sử', 'Chụp ảnh'],
    tags_en: ['Architecture', 'History', 'Photography'],
    mapUrl: '',
    location: 'Hồ Chí Minh',
    lat: 10.7798,
    lng: 106.6999,
    content_vi: (
      <div style={blogContainerStyle}>
        <p><strong>Bưu điện Thành phố Hồ Chí Minh</strong> là bưu điện lớn nhất Việt Nam và là một trong những kiệt tác kiến trúc Pháp cổ kính đẹp nhất khu vực Đông Dương còn tồn tại cho đến ngày nay. Trải qua hơn 130 năm thăng trầm, công trình không chỉ đảm nhận nhiệm vụ kết nối bưu chính truyền thống mà đã hóa thân thành một bảo tàng nghệ thuật sống động thu hút hàng vạn tâm hồn yêu cái đẹp ghé thăm mỗi tuần.</p>
        
        <h4 style={blogHeadingStyle}>Vài nét về Bưu điện Thành phố Hồ Chí Minh</h4>
        <p>Tọa lạc tại số 2 Công trường Công xã Paris, ngay cạnh nhà thờ Đức Bà cổ kính, tòa nhà được khởi công xây dựng từ năm 1886 đến năm 1891 mới hoàn thành. Được thiết kế bởi kiến trúc sư người Pháp lỗi lạc Gustave Eiffel - người đã khai sinh ra tháp Eiffel và tượng Nữ thần Tự do - tòa nhà mang đậm phong thái kiến trúc thời kỳ phục hưng kết hợp hài hòa với những đường nét mỹ thuật cổ điển.</p>
        
        <h4 style={blogHeadingStyle}>Kiến trúc độc đáo mang vẻ đẹp Phục Hưng cổ kính</h4>
        <p>Mặt tiền bưu điện thu hút mọi ánh nhìn với tông màu vàng pastel nhã nhặn, nổi bật là chiếc đồng hồ tròn cổ kính phía trên cửa chính ghi năm khởi công. Bước chân vào bên trong, bạn sẽ cảm giác như bước vào một nhà ga xe lửa châu Âu cổ xưa với những vòm trần uốn cong cao vút bằng sắt thép kiên cố. Hai bên tường vẫn lưu giữ hai bản đồ vẽ tay cổ họa lại lịch sử giao thông Sài Gòn xưa và Nam Kỳ lục tỉnh. Những dãy quầy giao dịch bằng gỗ lim sậm màu bóng loáng thời gian cùng các bốt điện thoại cổ kính vẫn đứng trầm mặc đưa bạn quay về thế kỷ trước.</p>
        
        <h4 style={blogHeadingStyle}>Những trải nghiệm không thể bỏ lỡ tại Bưu điện cổ</h4>
        <p>Đến đây, bạn không chỉ có cơ hội lưu giữ những tấm hình check-in triệu view trước cổng tòa nhà cổ kính, mà hãy thử một lần mua một tấm bưu thiếp in phong cảnh Việt Nam, ngồi viết những nét bút tay nắn nót và gửi về cho người thân yêu từ hòm thư bưu điện. Chắc chắn đó sẽ là món quà lưu niệm lãng mạn mang giá trị tinh thần to lớn vượt thời gian.</p>
      </div>
    ),
    content_en: (
      <div style={blogContainerStyle}>
        <p><strong>The Saigon Central Post Office</strong> is the largest post office in Vietnam and one of the oldest architectural masterpieces in Saigon, boasting over 130 years of history. More than just a postal hub, it is a cultural and artistic icon attracting millions of global visitors annually.</p>
        
        <h4 style={blogHeadingStyle}>A Quick Tour of Saigon Post Office History</h4>
        <p>Located at 2 Paris Square, District 1, the building was constructed between 1886 and 1891 based on the design of the famous French architect Gustave Eiffel. This period marked a transition from classical European architecture to modern industrial design, establishing a unique architectural identity in the heart of Saigon.</p>
        
        <h4 style={blogHeadingStyle}>The Fusion of French Renaissance and Eastern Architecture</h4>
        <p>The building stands out with its vibrant yellow paint under the Saigon sun, elegant arched windows, and meticulously carved iron pillars. Stepping inside, visitors are greeted by a massive high-vaulted ceiling that creates a grand, spacious atmosphere. On the side walls are two hand-painted historical maps: one depicting the old Saigon postal network and the other mapping 19th-century Southern Vietnam. Vintage ironwood telephone booths line the entrance, acting as a time machine back to the 19th century.</p>
        
        <h4 style={blogHeadingStyle}>Unmissable Experiences for Travelers</h4>
        <p>When visiting the post office, you must try choosing postcards featuring classic Saigon views, writing messages to loved ones, and mailing them directly from the vintage wooden mailboxes.</p>
      </div>
    )
  }
];

// ── Categories dùng key i18n ──────────────────────────────────────────────────
const CATEGORY_TRANS_KEYS = [
  { key: 'explore.catAll',         filterVal: 'all'        },
  { key: 'explore.catHeritage',    filterVal: 'explore.catHeritage'    },
  { key: 'explore.catNature',      filterVal: 'explore.catNature'      },
  { key: 'explore.catEntertainment', filterVal: 'explore.catEntertainment' },
  { key: 'explore.catSpiritual',   filterVal: 'explore.catSpiritual'   },
  { key: 'explore.catAttraction',  filterVal: 'explore.catAttraction'  },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ── AttractionCard ───────────
const AttractionCard = ({ item, onDetail, resolvedTitle, resolvedDesc, resolvedCategory, resolvedTags, resolvedDuration, t }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      hoverable
      onClick={() => onDetail(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: "hidden", height: "100%",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.4s", border: "1px solid #f0f0f0", cursor: "pointer",
      }}
      cover={
        <div style={{ overflow: "hidden", height: 220, position: "relative" }}>
          <img
            alt={resolvedTitle}
            src={item.img}
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.6s", transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
          />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
            padding: "20px 16px 12px",
          }}>
            <Tag style={{
              background: "rgba(201,169,97,0.9)", border: "none",
              color: "#1a1a1a", fontWeight: 600, borderRadius: 12,
            }}>
              <CompassOutlined /> {resolvedCategory}
            </Tag>
          </div>
        </div>
      }
      bodyStyle={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}
    >
      <Title level={4} style={{ marginBottom: 8 }}>
        <EnvironmentOutlined style={{ color: "#c9a961", marginRight: 8 }} />
        {resolvedTitle}
      </Title>

      <div style={{ display: "flex", gap: 16, marginBottom: 12, color: "#8c8c8c", fontSize: 13 }}>
        <span><CarOutlined /> {item.distance}</span>
        <span><ClockCircleOutlined /> {resolvedDuration}</span>
      </div>

      <Paragraph style={{ color: "#595959", flex: 1, fontSize: "0.9rem", lineHeight: 1.7 }}>
        {resolvedDesc}
      </Paragraph>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {resolvedTags?.map(tag => (
          <Tag key={tag} style={{ borderRadius: 12, border: "1px solid #d4b87a", color: "#8a7340", background: "#fdf8ed" }}>
            {tag}
          </Tag>
        ))}
      </div>

      <Divider style={{ margin: "0 0 12px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Rate disabled defaultValue={item.rating} allowHalf style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ marginLeft: 8 }}>{item.rating}</Text>
        </div>
        {item.lat && item.lng && (
          <Button
            type="text"
            onClick={(e) => { e.stopPropagation(); onDetail({ ...item, showMapOnly: true }); }}
            icon={<EnvironmentOutlined />}
            style={{ color: '#c9a961', fontWeight: 600 }}
          >
            {t('attractionsPage.map')}
          </Button>
        )}
      </div>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CustomerAttractionsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  const [detailModal, setDetailModal] = useState(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState('explore.catAll');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // ── Resolve item text theo ngôn ngữ hiện tại ──
  const resolveItem = (item) => {
    const title   = item.titleKey   ? t(item.titleKey)   : (lang === 'vi' ? item.title_vi   : item.title_en)   || item.title_vi;
    const desc    = item.descKey    ? t(item.descKey)    : (lang === 'vi' ? item.desc_vi    : item.desc_en)    || item.desc_vi;
    const category = item.categoryKey ? t(item.categoryKey) : (lang === 'vi' ? item.category : item.category);
    const tags    = item.tagsKey    ? t(item.tagsKey, { returnObjects: true }) : (lang === 'vi' ? item.tags_vi : item.tags_en) || item.tags_vi || [];
    const duration = item.durationKey ? t(item.durationKey) : (lang === 'vi' ? item.duration_vi : item.duration_en) || item.duration_vi;
    
    // Nếu có dạng content_vi/content_en dạng JSX thì ưu tiên sử dụng, ngược lại dùng fullContentKey từ file dịch
    const fullContent = item.content_vi || item.content_en 
      ? (lang === 'vi' ? item.content_vi : item.content_en)
      : (item.fullContentKey ? t(item.fullContentKey) : (lang === 'vi' ? item.desc_vi : item.desc_en) || '');
      
    return { ...item, resolvedTitle: title, resolvedDesc: desc, resolvedCategory: category, resolvedTags: Array.isArray(tags) ? tags : [], resolvedDuration: duration, resolvedFullContent: fullContent };
  };

  const resolvedData = LOCAL_GUIDES_DATA.map(resolveItem);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = resolvedData.filter(item => {
    const matchCategory = activeCategoryKey === 'explore.catAll' || item.categoryKey === activeCategoryKey;
    const matchSearch   = !search || item.resolvedTitle.toLowerCase().includes(search.toLowerCase());

    let matchLocation = true;
    if (userLocation) {
      if (item.lat && item.lng) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng);
        matchLocation = dist <= 100;
      } else { matchLocation = false; }
    } else if (locationFilter) {
      matchLocation = item.location === locationFilter;
    }
    return matchCategory && matchSearch && matchLocation;
  });

  // ── Geolocation ─────────────────────────────────────────────────────────────
  const handleNearMeClick = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const cityName = data.address.city || data.address.state || data.address.county || t('explore.area');
            setUserLocation({ lat, lng });
            setLocationFilter(t('explore.nearPrefix', { city: cityName }));
            message.success(t('explore.locationSuccess', { city: cityName }));
          } catch {
            setUserLocation({ lat, lng });
            setLocationFilter(t('explore.nearRadius'));
            message.success(t('explore.locationCoords'));
          } finally {
            setLocating(false);
            setSearchOpen(false);
          }
        },
        () => {
          setLocating(false);
          message.error(t('explore.locationError'));
        }
      );
    } else {
      setLocating(false);
      message.error(t('explore.geolocationUnsupported'));
    }
  };

  const selectSuggestion = (locationStr) => {
    setUserLocation(null);
    setLocationFilter(locationStr);
    setSearch('');
    setSearchOpen(false);
  };

  // ── Search suggestions ───────
  const SEARCH_SUGGESTIONS = {
    activities: [
      { title: lang === 'vi' ? 'Khám phá Chợ Bến Thành' : 'Explore Ben Thanh Market', subtitle: lang === 'vi' ? 'Di sản • TP. Hồ Chí Minh' : 'Heritage • Ho Chi Minh', id: 'g_hcm1', icon: <CompassOutlined /> },
      { title: lang === 'vi' ? 'Tham quan Dinh Độc Lập' : 'Visit Independence Palace', subtitle: lang === 'vi' ? 'Lịch sử • TP. Hồ Chí Minh' : 'History • Ho Chi Minh', id: 'g_hcm2', icon: <EnvironmentOutlined /> },
      { title: lang === 'vi' ? 'Ngắm cảnh từ Landmark 81 Skyview' : 'Landmark 81 Skyview Observatory', subtitle: lang === 'vi' ? 'Giải trí • TP. Hồ Chí Minh' : 'Entertainment • Ho Chi Minh', id: 'g_hcm3', icon: <CameraOutlined /> },
      { title: lang === 'vi' ? 'Tham quan Phố cổ Hội An' : 'Hoi An Ancient Town Tour', subtitle: lang === 'vi' ? 'Di sản • Đà Nẵng' : 'Heritage • Da Nang', id: 'g1', icon: <EnvironmentOutlined /> },
    ],
    destinations: [
      { title: 'Hồ Chí Minh', subtitle: 'Việt Nam', filterVal: 'Hồ Chí Minh' },
      { title: 'Đà Nẵng',     subtitle: 'Việt Nam', filterVal: 'Đà Nẵng' },
    ]
  };

  // ── Popover content ──────────────────────────────────────────────────────────
  const searchPopoverContent = (
    <div style={{ width: "100%", maxWidth: 700, padding: 16 }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f5f5f5", borderRadius: 8, cursor: "pointer", marginBottom: 20 }}
        onClick={handleNearMeClick}
      >
        <div style={{ background: "#e6f7ff", padding: 8, borderRadius: "50%", color: "#1890ff" }}>
          {locating ? <Spin size="small" /> : <CompassOutlined style={{ fontSize: 20 }} />}
        </div>
        <Text strong style={{ fontSize: 16 }}>{t('explore.nearMe')}</Text>
      </div>

      <Row gutter={32}>
        <Col span={12}>
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>{t('explore.topActivities')}</Text>
          {SEARCH_SUGGESTIONS.activities.map((act, idx) => (
            <div
              key={idx}
              onClick={() => {
                const guide = resolvedData.find(g => g.id === act.id);
                if (guide) { setDetailModal(guide); setSearchOpen(false); }
              }}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, cursor: "pointer" }}
            >
              <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, color: "#595959" }}>{act.icon}</div>
              <div>
                <Text strong style={{ display: "block", fontSize: 14 }}>{act.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{act.subtitle}</Text>
              </div>
            </div>
          ))}
        </Col>
        <Col span={12}>
          <Text strong style={{ display: "block", marginBottom: 12, color: "#595959" }}>{t('explore.popularDest')}</Text>
          {SEARCH_SUGGESTIONS.destinations.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => selectSuggestion(dest.filterVal)}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer" }}
            >
              <div style={{ background: "#f0f0f0", padding: 8, borderRadius: 8, color: "#595959" }}><EnvironmentOutlined /></div>
              <div>
                <Text strong style={{ display: "block", fontSize: 14 }}>{dest.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{dest.subtitle}</Text>
              </div>
            </div>
          ))}
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", height: "450px", borderRadius: 16, marginBottom: 48,
        overflow: "hidden", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 40px",
        backgroundImage: "url(https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1600&q=90)",
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <Title level={1} style={{
            color: "#fff", margin: 0,
            fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.2
          }}>
            {t('explore.heroTitle')}
          </Title>
          <Paragraph style={{
            color: "rgba(255,255,255,0.9)", fontSize: "1.1rem",
            marginTop: 16, letterSpacing: "0.5px",
          }}>
            {t('explore.heroSubtitle')}
          </Paragraph>

          <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
            <Popover
              content={searchPopoverContent}
              trigger="click"
              placement="bottomLeft"
              open={searchOpen}
              onOpenChange={setSearchOpen}
              overlayInnerStyle={{ borderRadius: 16, padding: 0 }}
            >
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: "#8c8c8c", fontSize: 20 }} />}
                placeholder={t('explore.searchPlaceholder')}
                value={locationFilter || search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLocationFilter('');
                  setUserLocation(null);
                }}
                style={{ width: "100%", maxWidth: 500, borderRadius: 30, height: 50, fontSize: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
            </Popover>
            <Button type="primary" size="large" style={{ borderRadius: 30, height: 50, padding: "0 32px", fontSize: 16, fontWeight: 600 }}>
              {t('explore.searchBtn')}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Active location filter tag ────────────────────────────────────────── */}
      {locationFilter && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Tag closable onClose={() => { setLocationFilter(''); setUserLocation(null); }} style={{ padding: "8px 16px", fontSize: 16, borderRadius: 20, background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}>
            <EnvironmentOutlined style={{ marginRight: 6 }} />
            {t('explore.area')}: {locationFilter}
          </Tag>
        </div>
      )}

      {/* ── Category Buttons ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, justifyContent: "center", alignItems: "center" }}>
        {CATEGORY_TRANS_KEYS.map(cat => (
          <Button
            key={cat.key}
            type={activeCategoryKey === cat.filterVal ? "primary" : "default"}
            onClick={() => setActiveCategoryKey(cat.filterVal)}
            style={{
              borderRadius: 20,
              ...(activeCategoryKey === cat.filterVal ? {
                background: "#c9a961", borderColor: "#c9a961",
              } : {
                borderColor: "#d4b87a", color: "#8a7340",
              }),
            }}
          >
            {t(cat.key)}
          </Button>
        ))}
      </div>

      {/* ── Cards Grid ───────────────────────────────────────────────────────── */}
      <Row gutter={[24, 24]}>
        {filtered.map(item => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <AttractionCard
              item={item}
              onDetail={setDetailModal}
              resolvedTitle={item.resolvedTitle}
              resolvedDesc={item.resolvedDesc}
              resolvedCategory={item.resolvedCategory}
              resolvedTags={item.resolvedTags}
              resolvedDuration={item.resolvedDuration}
              t={t}
            />
          </Col>
        ))}
      </Row>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <CompassOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={4} type="secondary">{t('explore.noResults')}</Title>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={720}
        centered
        destroyOnClose
        bodyStyle={{ padding: 0 }}
      >
        {detailModal && (() => {
          const resolved = resolveItem(detailModal);
          return (
            <div>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  alt={resolved.resolvedTitle}
                  src={detailModal.img}
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                  style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "40px 32px 24px" }}>
                  <Tag style={{ background: "rgba(201,169,97,0.9)", border: "none", color: "#1a1a1a", fontWeight: 600, borderRadius: 12, marginBottom: 8 }}>
                    <CompassOutlined /> {resolved.resolvedCategory}
                  </Tag>
                  <Title level={2} style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    {resolved.resolvedTitle}
                  </Title>
                </div>
              </div>
              <div style={{ padding: "24px 32px 32px" }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
                  <div><CarOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{detailModal.distance}</Text></div>
                  <div><ClockCircleOutlined style={{ color: "#c9a961", marginRight: 6 }} /><Text type="secondary">{resolved.resolvedDuration}</Text></div>
                  <div><StarFilled style={{ color: "#c9a961", marginRight: 6 }} /><Rate disabled defaultValue={detailModal.rating} allowHalf style={{ fontSize: 14 }} /></div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {resolved.resolvedTags?.map(tag => (
                    <Tag key={tag} style={{ borderRadius: 12, border: "1px solid #d4b87a", color: "#8a7340", background: "#fdf8ed" }}>{tag}</Tag>
                  ))}
                </div>

                <Divider />

                {/* Phần chứa bài viết có scrollbar thanh lịch và giới hạn chiều cao tối đa để tránh tràn */}
                <div 
                  style={{ 
                    maxHeight: "350px", 
                    overflowY: "auto", 
                    paddingRight: "12px", 
                    scrollbarWidth: "thin", 
                    scrollbarColor: "#c9a961 #f5f5f5"
                  }}
                >
                  {typeof resolved.resolvedFullContent === 'string' ? (
                    <div 
                      style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#444", textAlign: "justify" }}
                      dangerouslySetInnerHTML={{ __html: resolved.resolvedFullContent }}
                    />
                  ) : (
                    resolved.resolvedFullContent
                  )}
                </div>

                {detailModal.lat && detailModal.lng && (
                  <>
                    <Divider />
                    <Title level={5} style={{ marginBottom: 16 }}>{t('explore.mapLocation')}</Title>
                    <FreeMap lat={detailModal.lat} lng={detailModal.lng} title={resolved.resolvedTitle} />
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CustomerAttractionsPage;
