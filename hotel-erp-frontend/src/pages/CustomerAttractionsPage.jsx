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

// ── Data tĩnh (title/desc/tag dùng key i18n khi có, còn lại là tiếng Việt không dịch) ──
const LOCAL_GUIDES_DATA = [
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
    fullContent_vi: `
      <h3>Vài nét về Chợ Bến Thành</h3>
      <p>Nằm ngay tại trung tâm Quận 1, Chợ Bến Thành không chỉ đơn thuần là một địa điểm buôn bán sầm uất mà còn là nhân chứng lịch sử kiêu hãnh của Sài Gòn qua hơn một thế kỷ. Được xây dựng từ năm 1912 bởi người Pháp, ngôi chợ này đã trở thành biểu tượng văn hóa và du lịch không thể thiếu của thành phố mang tên Bác.</p>
      
      <h3>Kiến trúc độc đáo mang dấu ấn thời gian</h3>
      <p>Điểm nhấn đặc biệt nhất của Chợ Bến Thành chính là ngôi tháp đồng hồ bốn mặt sừng sững tại cửa Nam - biểu tượng nhận diện nổi tiếng trên toàn thế giới. Chợ có thiết kế thông thoáng với 4 cửa chính (Đông, Tây, Nam, Bắc) hướng ra các ngã đường huyết mạch của trung tâm Sài Gòn, cùng với 12 cửa phụ tạo nên một mạng lưới giao thương vô cùng nhộn nhịp.</p>
      
      <h3>Trải nghiệm ẩm thực phong phú khó cưỡng</h3>
      <p>Bước chân vào khu ẩm thực trong chợ, bạn sẽ bị choáng ngợp bởi hàng trăm gian hàng tỏa hương thơm nức mũi. Tại đây, bạn có thể thưởng thức những món ăn đặc sản đậm chất Nam Bộ như hủ tiếu Nam Vang, bánh xèo giòn rụm, bún thịt nướng thơm lừng, cho đến các ly chè Sài Gòn thanh mát, ngọt lịm ngọt ngào.</p>
      
      <h3>Kinh nghiệm mua sắm và quà lưu niệm</h3>
      <p>Chợ Bến Thành là thiên đường của các loại hàng thủ công mỹ nghệ, đồ da, quần áo, vải vóc và các loại cà phê, trà thượng hạng. Một mẹo nhỏ cho du khách khi mua sắm tại đây là hãy thương lượng giá cả một cách vui vẻ để có được những món quà lưu niệm ý nghĩa với mức giá ưng ý nhất.</p>
    `,
    fullContent_en: `
      <h3>Introduction to Ben Thanh Market</h3>
      <p>Located in the heart of District 1, Ben Thanh Market is not just a bustling trading hub but also a proud historical witness of Saigon for over a century. Built in 1912 by the French, this market has become an indispensable cultural and tourism icon of Ho Chi Minh City.</p>
      
      <h3>Unique Architecture & Timeless Landmark</h3>
      <p>The most prominent feature of Ben Thanh Market is the three-domed clock tower at the South Gate, a globally recognized symbol of Saigon. The market features a spacious design with 4 main gates (East, West, South, North) facing major streets in central Saigon, along with 12 side gates forming a lively trading network.</p>
      
      <h3>Unmissable Culinary Experiences</h3>
      <p>Stepping into the market's food court, you will be overwhelmed by hundreds of stalls offering aromatic local dishes. Here, you can savor authentic Southern specialties such as Hu Tieu Nam Vang, crispy Banh Xeo, fragrant Bun Thit Nuong, and sweet, refreshing Saigon sweet soups.</p>
      
      <h3>Shopping Tips & Souvenirs</h3>
      <p>Ben Thanh Market is a paradise for handicrafts, leather goods, textiles, and premium coffee and tea. A small tip for travelers shopping here is to bargain politely and cheerfully to get the best prices for your souvenirs.</p>
    `
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
    fullContent_vi: `
      <h3>Chứng nhân lịch sử kiêu hùng của dân tộc</h3>
      <p>Dinh Độc Lập (hay còn gọi là Dinh Thống Nhất) là một trong những di tích quốc gia đặc biệt quan trọng của Việt Nam. Đây là nơi ghi dấu thời khắc lịch sử trọng đại vào trưa ngày 30/4/1975, khi chiếc xe tăng số hiệu 390 của quân giải phóng húc đổ cánh cổng sắt, đánh dấu sự thống nhất hoàn toàn của đất nước.</p>
      
      <h3>Kiến trúc Á Đông hiện đại đầy chiều sâu</h3>
      <p>Công trình được thiết kế bởi kiến trúc sư tài hoa Ngô Viết Thụ - người Việt Nam đầu tiên đạt giải Khôi nguyên La Mã. Dinh có bố cục mặt bằng hình chữ "CÁT" mang ý nghĩa tốt lành, kết hợp khéo léo giữa đường nét hình khối hiện đại của phương Tây và các yếu tố phong thủy truyền thống đầy chiều sâu của phương Đông.</p>
      
      <h3>Khám phá các gian phòng quyền lực và khu hầm trú ẩn</h3>
      <p>Hành trình tham quan Dinh Độc Lập sẽ đưa bạn qua hơn 100 căn phòng được trang trí lộng lẫy như phòng khánh tiết, phòng đại yến, phòng trình quốc thư. Đặc biệt, khu vực tầng hầm kiên cố với hệ thống thông tin liên lạc cổ kính cùng bản đồ tác chiến thời chiến vẫn được bảo tồn nguyên vẹn.</p>
      
      <h3>Khuôn viên xanh mát giữa lòng thành phố</h3>
      <p>Bao quanh Dinh là thảm cỏ xanh mướt hình oval rộng lớn và những hàng cây cổ thụ hàng trăm năm tuổi rợp bóng mát. Đây là không gian yên bình tuyệt đối, tách biệt hoàn toàn khỏi sự ồn ào, náo nhiệt của phố thị Sài Gòn bên ngoài.</p>
    `,
    fullContent_en: `
      <h3>A Historic Witness of National Unity</h3>
      <p>The Independence Palace (also known as Reunification Palace) is one of Vietnam's most important national historic sites. It marked the historic moment on April 30, 1975, when liberation army tanks crashed through the gates, symbolizing the reunification of Vietnam.</p>
      
      <h3>Masterful Fusion of Modern & Eastern Architecture</h3>
      <p>Designed by the talented architect Ngo Viet Thu, the palace's layout resembles the Chinese character for "Good Fortune". It seamlessly combines modern Western geometric design with traditional Eastern feng shui and philosophical elements.</p>
      
      <h3>Explore the Power Rooms & Underground Bunker</h3>
      <p>Your journey through the palace will take you through over 100 beautifully decorated rooms, including the Reception Room, Banqueting Room, and Cabinet Room. The highlight is the underground bunker with vintage communications equipment and military maps preserved in their original state.</p>
      
      <h3>A Green Oasis in the City Center</h3>
      <p>Surrounding the Palace is a vast oval lawn and century-old trees offering cool shade. It is a peaceful green oasis, completely detached from the hustle and bustle of modern Saigon outside.</p>
    `
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
    fullContent_vi: `
      <h3>Đỉnh cao mới vươn tầm thế giới</h3>
      <p>Với chiều cao ấn tượng 461.3m gồm 81 tầng, Landmark 81 tự hào là tòa nhà cao nhất Việt Nam và là biểu tượng của sự năng động, phát triển vượt bậc của TP.HCM. Lấy cảm hứng từ hình ảnh "bó tre" truyền thống - biểu tượng cho sức mạnh kiên cường và tinh thần đoàn kết của người Việt, tòa nhà vươn cao kiêu hãnh bên bờ sông Sài Gòn thơ mộng.</p>
      
      <h3>Trải nghiệm Skyview ngắm trọn Sài Gòn 360 độ</h3>
      <p>Nằm tại 3 tầng cao nhất (tầng 79, 80, 81), đài quan sát Skyview mang đến cho du khách trải nghiệm độc nhất vô nhị khi được ngắm nhìn toàn cảnh thành phố từ độ cao gần 400m. Cảm giác bước chân ra cầu kính SkyTouch lơ lửng giữa không trung chắc chắn sẽ khiến những tín đồ mê mạo hiểm phấn khích tột độ.</p>
      
      <h3>Thiên đường mua sắm và vui chơi giải trí cao cấp</h3>
      <p>Bên trong tòa nhà là trung tâm thương mại Vincom Center sầm uất quy tụ hàng loạt thương hiệu thời trang cao cấp thế giới. Nơi đây còn sở hữu rạp chiếu phim CGV với phòng chiếu IMAX siêu lớn, sân băng tự nhiên Vincom Ice Rink lớn nhất Việt Nam và hệ thống nhà hàng ẩm thực đa quốc gia sang trọng.</p>
      
      <h3>Gợi ý thời điểm check-in lý tưởng nhất</h3>
      <p>Thời điểm tuyệt vời nhất để ghé thăm Landmark 81 là vào khoảng 4h30 chiều. Bạn có thể đón trọn khoảnh khắc hoàng hôn lãng mạn nhuộm vàng cả thành phố và ngắm nhìn Sài Gòn chuyển mình rực rỡ, lung linh sắc màu khi lên đèn.</p>
    `,
    fullContent_en: `
      <h3>A New Architectural Peak of Vietnam</h3>
      <p>Standing at 461.3 meters with 81 stories, Landmark 81 is the tallest skyscraper in Vietnam and a symbol of Ho Chi Minh City's rapid development. Inspired by the traditional Vietnamese "bamboo bundle" - representing strength and solidarity - the building rises proudly along the Saigon River.</p>
      
      <h3>Landmark 81 Skyview Observatory</h3>
      <p>Spanning the top three floors (79, 80, 81), the Skyview Observatory offers visitors the unique experience of viewing the entire city from nearly 400 meters high. Walking on the transparent glass bridge "SkyTouch" suspended in the air is an unforgettable thrill for adventure seekers.</p>
      
      <h3>Luxury Shopping & Entertainment Destination</h3>
      <p>Inside the skyscraper is the Vincom Center, a premium shopping mall home to world-class brands. It also features a giant CGV IMAX theater, Vincom Ice Rink (Vietnam's largest natural ice rink), and a diverse array of fine dining restaurants.</p>
      
      <h3>Best Time to Visit</h3>
      <p>The best time to visit Landmark 81 is around 4:30 PM. You can catch the stunning sunset over the Saigon River and watch the city transform into a sea of glittering lights as night falls.</p>
    `
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
    fullContent_vi: `
      <h3>Trái tim sôi động của thành phố không ngủ</h3>
      <p>Phố đi bộ Nguyễn Huệ là con đường quảng trường hiện đại bậc nhất Việt Nam, nối liền Trụ sở UBND Thành phố đến bờ sông Sài Gòn. Nơi đây được ví như trái tim của Sài Gòn, luôn ngập tràn năng lượng trẻ trung và là điểm vui chơi quen thuộc của người dân lẫn du khách mỗi tối.</p>
      
      <h3>Không gian trình diễn nghệ thuật đường phố đa sắc màu</h3>
      <p>Mỗi khi đêm xuống, con phố khoác lên mình vẻ ngoài lung linh nhờ hệ thống nhạc nước nghệ thuật. Bạn sẽ dễ dàng bắt gặp những nhóm bạn trẻ say mê biểu diễn âm nhạc acoustic, nhảy hiện đại, hay các chương trình lễ hội quy mô lớn được tổ chức định kỳ đầy ấn tượng.</p>
      
      <h3>Huyền thoại Chung cư 42 Nguyễn Huệ</h3>
      <p>Một điểm nhấn không thể bỏ qua chính là Chung cư 42 Nguyễn Huệ. Tòa nhà cổ kính này đã được cải tạo thành tổ hợp quán cà phê, trà chiều và cửa hàng thời trang xinh xắn xếp lớp như những khối rubik màu sắc. Đây là địa điểm lý tưởng để ngồi nhâm nhi cà phê và ngắm nhìn dòng người nhộn nhịp bên dưới.</p>
      
      <h3>Thưởng thức tinh hoa ẩm thực đường phố</h3>
      <p>Quanh khu vực phố đi bộ là thế giới ẩm thực đường phố đầy màu sắc với trà sữa sang chảnh, bánh tráng nướng giòn rụm, kem bơ béo ngậy, bingsu mát lạnh... hứa hẹn mang lại những trải nghiệm ẩm thực vô cùng thú vị.</p>
    `,
    fullContent_en: `
      <h3>The Heart of the City That Never Sleeps</h3>
      <p>Nguyen Hue Walking Street is Vietnam's most modern boulevard plaza, connecting the City Hall to the Saigon River bank. It is widely considered the heart of Saigon, brimming with youth energy and serving as a prime gathering spot for locals and tourists alike.</p>
      
      <h3>Vibrant Street Art & Music Performances</h3>
      <p>At night, the street lights up beautifully with colorful musical fountains. You will easily spot local youth groups performing acoustic sets, street dance, and magic tricks, alongside large-scale cultural festivals held during holidays.</p>
      
      <h3>The Iconic Cafe Apartment at 42 Nguyen Hue</h3>
      <p>A must-visit highlight is the historic Cafe Apartment building at No. 42. This old apartment block has been transformed into a charming vertical grid of coffee shops and fashion boutiques. It's the perfect place to sit back, sip Vietnamese coffee, and watch the bustling street below.</p>
      
      <h3>Street Food Paradise</h3>
      <p>Surrounding the walking street is a vibrant culinary world featuring trendy bubble teas, crispy grilled rice paper (Vietnamese pizza), creamy avocado ice cream, and modern desserts, guaranteeing an exciting street food tour.</p>
    `
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
    fullContent_vi: `
      <h3>Kiệt tác kiến trúc Phục Hưng Pháp cổ kính</h3>
      <p>Tọa lạc tại Công xã Paris, Bưu điện Thành phố Hồ Chí Minh là một trong những công trình kiến trúc Pháp cổ kính đẹp nhất Đông Dương còn sót lại. Được xây dựng từ năm 1886 đến 1891 bởi kiến trúc sư lừng danh người Pháp Gustave Eiffel, tòa nhà mang vẻ đẹp sang trọng, quý phái của phong cách Phục Hưng Âu châu.</p>
      
      <h3>Không gian nội thất cổ điển đầy hoài niệm</h3>
      <p>Bước qua cánh cổng sắt, bạn sẽ được chiêm ngưỡng mái vòm cuốn cao vút nâng đỡ bởi hàng cột sắt kiên cố nhuốm màu thời gian. Điểm độc đáo bên trong bưu điện chính là hai bản đồ cổ vẽ tay tỉ mỉ mô tả Sài Gòn xưa, cùng những bốt điện thoại bằng gỗ cổ kính đưa du khách quay về thế kỷ 19.</p>
      
      <h3>Nơi lưu giữ nét đẹp gửi thư tay truyền thống</h3>
      <p>Dù xã hội hiện đại phát triển, Bưu điện Trung tâm Sài Gòn vẫn thực hiện chức năng bưu chính của mình. Du khách ghé thăm thường thích thú tự tay chọn những tấm bưu thiếp phong cảnh đẹp đẽ, viết những lời chúc đong đầy yêu thương để gửi về cho người thân, bạn bè.</p>
      
      <h3>Góc chụp ảnh triệu view khó lòng bỏ qua</h3>
      <p>Với gam màu vàng pastel đặc trưng, những ô cửa sổ hình vòm cuốn duyên dáng và ban công gỗ cổ xưa, bưu điện là phông nền hoàn hảo cho mọi bức ảnh check-in. Vị trí đắc địa ngay cạnh Nhà thờ Đức Bà cổ kính càng tạo nên một cụm di tích tham quan tuyệt đẹp giữa lòng thành phố.</p>
    `,
    fullContent_en: `
      <h3>A Classic French Renaissance Masterpiece</h3>
      <p>Located at Paris Square, the Saigon Central Post Office is one of the most beautiful French colonial buildings in Indochina. Built between 1886 and 1891 by the famous architect Gustave Eiffel, the building boasts the elegant and classic beauty of European Renaissance architecture.</p>
      
      <h3>Nostalgic Classical Interior Space</h3>
      <p>Passing through the iron gates, you will marvel at the high vaulted ceilings supported by historic iron pillars. Inside, two hand-painted historical maps depicting old Saigon and vintage wooden telephone booths transport visitors back to the late 19th century.</p>
      
      <h3>Preserving the Tradition of Handwritten Letters</h3>
      <p>Despite modern technology, the post office still operates fully. Visitors love choosing postcards featuring local landmarks, writing heartfelt wishes, and mailing them directly to family and friends worldwide.</p>
      
      <h3>An Iconic Photo Spot Next to Notre Dame</h3>
      <p>With its signature pastel yellow walls, graceful arched windows, and old wooden shutters, the post office is a perfect backdrop for travel photos. Its prime location next to the historic Notre Dame Cathedral forms a magnificent sightseeing complex in Saigon.</p>
    `
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

  // ── Resolve item text theo ngôn ngữ hiện tại ────────────────────────────────
  const resolveItem = (item) => {
    const title   = item.titleKey   ? t(item.titleKey)   : (lang === 'vi' ? item.title_vi   : item.title_en)   || item.title_vi;
    const desc    = item.descKey    ? t(item.descKey)    : (lang === 'vi' ? item.desc_vi    : item.desc_en)    || item.desc_vi;
    const category = item.categoryKey ? t(item.categoryKey) : (lang === 'vi' ? item.category : item.category);
    const tags    = item.tagsKey    ? t(item.tagsKey, { returnObjects: true }) : (lang === 'vi' ? item.tags_vi : item.tags_en) || item.tags_vi || [];
    const duration = item.durationKey ? t(item.durationKey) : (lang === 'vi' ? item.duration_vi : item.duration_en) || item.duration_vi;
    const fullContent = item.fullContentKey ? t(item.fullContentKey) : (lang === 'vi' ? item.fullContent_vi : item.fullContent_en) || (lang === 'vi' ? item.desc_vi : item.desc_en) || '';
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
      {/* CSS custom cho phần hiển thị blog trong Modal */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h3 {
          font-size: 1.25rem !important;
          color: #1a1a1a !important;
          margin-top: 24px !important;
          margin-bottom: 12px !important;
          font-weight: 600 !important;
          border-left: 4px solid #c9a961 !important;
          padding-left: 12px !important;
        }
        .blog-content p {
          margin-bottom: 16px !important;
          text-align: justify !important;
          font-size: 0.95rem !important;
          line-height: 1.8 !important;
          color: #444 !important;
        }
        .blog-content ul {
          margin-bottom: 16px !important;
          padding-left: 20px !important;
        }
        .blog-content li {
          margin-bottom: 8px !important;
          font-size: 0.95rem !important;
          color: #444 !important;
        }
      `}} />

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

                {/* Render nội dung chi tiết dạng HTML sạch */}
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: resolved.resolvedFullContent || resolved.resolvedDesc }}
                />

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
