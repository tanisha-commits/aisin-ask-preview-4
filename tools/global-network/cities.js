// [match regex (tested against address, then name), label, lat, lon]
module.exports=[
// Japan
[/Kariya/i,'Kariya, Aichi, Japan',34.989,136.990],[/Toyota, Aichi|Toyota, Aichi|, Toyota,/i,'Toyota, Aichi, Japan',35.083,137.156],
[/Takahama, Aichi/i,'Takahama, Aichi, Japan',34.928,136.988],[/Imizu, Toyama/i,'Imizu, Toyama, Japan',36.730,137.081],[/Ueda/i,'Ueda, Nagano, Japan',36.402,138.249],[/Toyokawa/i,'Toyokawa, Aichi, Japan',34.827,137.376],
[/Echizen/i,'Echizen, Fukui, Japan',35.903,136.169],[/Nishio, Aichi/i,'Nishio, Aichi, Japan',34.867,137.062],[/Hekinan/i,'Hekinan, Aichi, Japan',34.885,136.993],
[/Tahara/i,'Tahara, Aichi, Japan',34.669,137.264],[/Nankan|Tamana/i,'Nankan, Kumamoto, Japan',32.993,130.565],[/Kumamoto/i,'Kumamoto, Japan',32.803,130.708],
[/Chiryu/i,'Chiryu, Aichi, Japan',35.002,137.051],[/Anjo/i,'Anjo, Aichi, Japan',34.959,137.080],[/Iwate|Kanegasaki/i,'Kanegasaki, Iwate, Japan',39.196,141.116],
[/Tomakomai/i,'Tomakomai, Hokkaido, Japan',42.634,141.605],[/Nyuzen/i,'Nyuzen, Toyama, Japan',36.934,137.502],[/Mizunami/i,'Mizunami, Gifu, Japan',35.362,137.254],
[/Hidaka, Saitama/i,'Hidaka, Saitama, Japan',35.908,139.339],[/Chiyoda-ku, Tokyo/i,'Chiyoda, Tokyo, Japan',35.684,139.767],[/Atsugi/i,'Atsugi, Kanagawa, Japan',35.443,139.362],
[/Tsuruoka/i,'Tsuruoka, Yamagata, Japan',38.727,139.827],[/Miyagi/i,'Ohira, Miyagi, Japan',38.474,140.832],[/Higashiura/i,'Higashiura, Aichi, Japan',34.977,136.966],
[/Takaoka, Toyama/i,'Takaoka, Toyama, Japan',36.754,137.026],[/Tonami/i,'Tonami, Toyama, Japan',36.647,136.962],[/Obu, Aichi/i,'Obu, Aichi, Japan',35.011,136.964],
[/Nagoya/i,'Nagoya, Aichi, Japan',35.181,136.906],[/Wakasa/i,'Wakasa, Fukui, Japan',35.548,135.908],[/Itami/i,'Itami, Hyogo, Japan',34.784,135.400],
[/Kitakyushu/i,'Kitakyushu, Fukuoka, Japan',33.883,130.875],[/Hamamatsu/i,'Hamamatsu, Shizuoka, Japan',34.711,137.726],[/Tateshina/i,'Tateshina, Nagano, Japan',36.169,138.307],
[/Saku City/i,'Saku, Nagano, Japan',36.249,138.477],[/Tomi City/i,'Tomi, Nagano, Japan',36.360,138.330],[/Sasebo/i,'Sasebo, Nagasaki, Japan',33.180,129.715],
// North America
[/Plymouth, Michigan/i,'Plymouth, Michigan, USA',42.371,-83.470],[/London, KY/i,'London, Kentucky, USA',37.129,-84.083],[/Clinton, TN/i,'Clinton, Tennessee, USA',36.103,-84.131],
[/Crothersville/i,'Crothersville, Indiana, USA',38.800,-85.842],[/Marion, IL/i,'Marion, Illinois, USA',37.731,-88.933],[/Seymour/i,'Seymour, Indiana, USA',38.959,-85.890],
[/Durham/i,'Durham, North Carolina, USA',36.050,-78.850],[/Cibolo/i,'Cibolo, Texas, USA',29.562,-98.227],[/Northville/i,'Northville, Michigan, USA',42.431,-83.483],
[/San Jose/i,'San Jose, California, USA',37.383,-121.930],[/Fowlerville/i,'Fowlerville, Michigan, USA',42.660,-84.073],[/Ann Arbor/i,'Ann Arbor, Michigan, USA',42.281,-83.743],
[/LaGrange/i,'LaGrange, Georgia, USA',33.039,-85.031],[/Terre Haute/i,'Terre Haute, Indiana, USA',39.467,-87.414],[/Lebanon, Ohio/i,'Lebanon, Ohio, USA',39.435,-84.203],
[/Tell City/i,'Tell City, Indiana, USA',37.951,-86.768],[/Rushville/i,'Rushville, Indiana, USA',39.609,-85.446],[/Dalton/i,'Dalton, Georgia, USA',34.770,-84.970],
[/Gordonsville/i,'Gordonsville, Tennessee, USA',36.173,-85.929],[/Smithville/i,'Smithville, Tennessee, USA',35.961,-85.814],[/Stratford/i,'Stratford, Ontario, Canada',43.370,-80.982],
// Central & South America
[/Itu, Sao|itu, SP/i,'Itu, São Paulo, Brazil',-23.264,-47.299],[/Comonfort/i,'Comonfort, Guanajuato, Mexico',20.721,-100.761],[/Cienega de Flores/i,'Ciénega de Flores, Nuevo León, Mexico',25.957,-100.170],
[/Lagos de Moreno/i,'Lagos de Moreno, Jalisco, Mexico',21.356,-101.930],[/Irapuato/i,'Irapuato, Guanajuato, Mexico',20.677,-101.355],[/Colon, Panama/i,'Colón, Panama',9.359,-79.901],
// Europe
[/Neu-Isenburg/i,'Neu-Isenburg, Germany',50.053,8.694],[/Braine/i,"Braine-l'Alleud, Belgium",50.684,4.373],[/Pisek|Písek/i,'Písek, Czech Republic',49.309,14.147],
[/Birmingham/i,'Birmingham, United Kingdom',52.459,-1.990],[/Sophia Antipolis/i,'Sophia Antipolis, France',43.616,7.055],[/Tuzla/i,'Tuzla, Istanbul, Turkey',40.851,29.300],
// China
[/Changning District,Shanghai|Changning District, Shanghai/i,'Changning, Shanghai, China',31.220,121.424],[/Minhang District, Shanghai/i,'Minhang, Shanghai, China',31.192,121.392],
[/Shunde/i,'Shunde, Foshan, China',22.840,113.250],[/Nanhai, Foshan/i,'Nanhai, Foshan, China',23.030,113.140],[/Wuzhong District, Suzhou/i,'Wuzhong, Suzhou, China',31.262,120.632],
[/Suzhou Industrial Park/i,'Suzhou Industrial Park, China',31.310,120.710],[/Beichen/i,'Beichen, Tianjin, China',39.225,117.135],[/Tianjin/i,'Binhai, Tianjin, China',39.030,117.680],
[/Wuxi/i,'Wuxi, Jiangsu, China',31.490,120.310],[/広州|Panyu/i,'Panyu, Guangzhou, China',22.940,113.380],[/zunhua/i,'Zunhua, Hebei, China',40.190,117.960],
[/Tangshan/i,'Fengrun, Tangshan, China',39.832,118.162],[/Yunfu/i,'Yunfu, Guangdong, China',22.920,112.040],[/Taizhou/i,'Luqiao, Taizhou, China',28.580,121.370],
[/Ningbo/i,'Hangzhou Bay, Ningbo, China',30.300,121.170],[/Fuzhou/i,'Minhou, Fuzhou, China',25.940,119.370],[/Changzhou/i,'Wujin, Changzhou, China',31.700,119.950],
[/Nansha/i,'Nansha, Guangzhou, China',22.800,113.530],[/Guangzhou Economic/i,'Huangpu, Guangzhou, China',23.270,113.580],[/Anqing|Anquing/i,'Anqing, Anhui, China',30.540,117.060],
[/Binzhou/i,'Binzhou, Shandong, China',37.380,117.970],[/WAFANGDIAN/i,'Wafangdian, Liaoning, China',39.630,122.000],
// India
[/Rohtak/i,'Rohtak, Haryana, India',28.895,76.606],[/Narasapura/i,'Narasapura, Kolar, Karnataka, India',13.150,78.030],[/Bidadi/i,'Bidadi, Karnataka, India',12.797,77.388],
// SE Asia & others
[/Kuningan/i,'Jakarta, Indonesia',-6.230,106.830],[/Cikarang/i,'Cikarang, Bekasi, Indonesia',-6.340,107.150],[/Suryacipta/i,'Suryacipta, Karawang, Indonesia',-6.380,107.370],
[/Karawang/i,'KIIC, Karawang, Indonesia',-6.360,107.290],[/Santa Rosa/i,'Santa Rosa, Laguna, Philippines',14.270,121.080],[/Singapore/i,'Singapore',1.275,103.846],
[/Kuala Lumpur/i,'Kuala Lumpur, Malaysia',3.118,101.676],[/Seoul/i,'Seoul, Republic of Korea',37.521,126.924],[/Ladkrabang/i,'Lat Krabang, Bangkok, Thailand',13.722,100.750],
[/Bangkok/i,'Bang Na, Bangkok, Thailand',13.668,100.640],[/Bangpakong|Chachoengsao/i,'Bang Pakong, Chachoengsao, Thailand',13.600,101.010],[/Bankhai/i,'Ban Khai, Rayong, Thailand',12.800,101.300],
[/Pluak ?Daeng/i,'Pluak Daeng, Rayong, Thailand',13.000,101.170],[/Khao Khan Song/i,'Si Racha, Chonburi, Thailand',13.100,101.100],[/Bowin/i,'Bo Win, Si Racha, Chonburi, Thailand',13.050,101.090],
[/Phanthong/i,'Amata City, Phan Thong, Chonburi, Thailand',13.420,101.050],[/Don ?Hua ?Ro|Donhuaroh/i,'Mueang Chonburi, Thailand',13.380,101.030],[/Kabinburi/i,'Kabin Buri, Prachinburi, Thailand',13.980,101.710],
[/Si Maha Phot/i,'Si Maha Phot, Prachinburi, Thailand',13.970,101.520],[/Bangbuathong/i,'Bang Bua Thong, Nonthaburi, Thailand',13.910,100.420],[/Nongkhae/i,'Nong Khae, Saraburi, Thailand',14.330,100.870],
[/Banmhor/i,'Ban Mo, Saraburi, Thailand',14.620,100.730],[/Pathumtani|Navanakorn/i,'Navanakorn, Pathum Thani, Thailand',14.100,100.620],[/Taichung/i,'Taichung, Taiwan',24.170,120.600],
[/Dubai/i,'Dubai, UAE',25.069,55.141],[/Umbogintwini/i,'Umbogintwini, KwaZulu-Natal, South Africa',-30.030,30.900],
];
