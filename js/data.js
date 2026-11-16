// ---------------------------------------------------------------------------
// Güneş Sistemi verileri ve Türkçe bilgi metinleri
//
// Fiziksel değerler NASA Planetary Fact Sheet değerlerine dayanır.
// Yörünge öğeleri J2000 dönemine ait yaklaşık ortalama değerlerdir.
//   yaricap : Dünya yarıçapı cinsinden ortalama yarıçap
//   a       : yarı büyük eksen (AB)
//   e       : dış merkezlik
//   egim    : yörünge eğikliği (derece, tutulum düzlemine göre)
//   dugum   : çıkış düğümü boylamı (derece)
//   enberi  : enberi boylamı (derece)
//   L0      : J2000 anındaki ortalama boylam (derece)
//   yil     : yörünge periyodu (Dünya günü)
//   gun     : kendi ekseni etrafında dönüş periyodu (Dünya günü)
//   egiklik : eksen eğikliği (derece). 90°'den büyük değer ters dönüş demektir.
// ---------------------------------------------------------------------------

// ---- Ölçek ----------------------------------------------------------------
// Gerçek oranlarla hiçbir şey ekrana sığmaz; bu yüzden sıkıştırılmış ölçek
// kullanılır. Sıra ve büyüklük ilişkileri korunur.
export const GUNES_YARICAP = 9;

/** Gezegen yarıçapı: (R / R_dünya)^0.55 → Dünya = 1 birim, Jüpiter ≈ 3,7 birim. */
export function olcekYaricap(dunyaYaricapi) {
  return Math.pow(dunyaYaricapi, 0.55);
}

/** Uydu yarıçapı: aynı formül, gezegenlere göre biraz küçültülmüş; çok küçükler için alt sınır. */
export function olcekUyduYaricap(dunyaYaricapi) {
  return Math.max(0.075, 0.75 * Math.pow(dunyaYaricapi, 0.55));
}

/** Güneş'e uzaklık: 18 + 56·√AB → Merkür ≈ 53, Dünya = 74, Neptün ≈ 325 birim. */
export function olcekUzaklik(ab) {
  return 18 + 56 * Math.sqrt(ab);
}

/** Uyduların sahnedeki yörünge periyodu (gün): gerçek periyodun karekök sıkıştırması. */
export function olcekUyduPeriyot(gun) {
  return 2.5 * Math.sqrt(gun);
}

// ---- Gövdeler -------------------------------------------------------------
export const GOVDELER = [
  {
    id: 'gunes',
    ad: 'Güneş',
    tur: 'Yıldız · G2V sarı cüce',
    renkler: ['#ffd27a', '#ff7a1a'],
    doku: '2k_sun.jpg',
    gun: 25.4,
    egiklik: 7.25,
    aciklama:
      'Güneş Sistemi\'nin kalbi ve kütlesinin yüzde 99,86\'sı. Çekirdeğinde her saniye yaklaşık 600 milyon ton hidrojeni helyuma dönüştürür; açığa çıkan enerji bütün gezegenleri aydınlatır ve Dünya\'daki yaşamı mümkün kılar.',
    veriler: [
      ['Çap', '1.392.700 km'],
      ['Dünya\'ya uzaklık', '149,6 milyon km · 1 AB'],
      ['Ekvatorda dönüş', '≈ 25 gün'],
      ['Galaksi turu', '≈ 230 milyon yıl'],
      ['Gezegen sayısı', '8'],
      ['Yüzey sıcaklığı', '≈ 5.500 °C'],
      ['Yüzey çekimi', '274 m/s²'],
      ['Yaş', '≈ 4,6 milyar yıl'],
    ],
    bilgiler: [
      'Güneş\'in içine yaklaşık 1,3 milyon Dünya sığar.',
      'Işığı Dünya\'ya 8 dakika 20 saniyede ulaşır; gökyüzünde gördüğün Güneş, sekiz dakika önceki hâlidir.',
      'Çekirdeği yaklaşık 15 milyon °C\'dir; dış atmosferi olan korona ise şaşırtıcı biçimde yüzeyden yüzlerce kat daha sıcaktır.',
    ],
  },
  {
    id: 'merkur',
    ad: 'Merkür',
    tur: 'Karasal gezegen',
    renkler: ['#c9c2b8', '#6e665e'],
    doku: '2k_mercury.jpg',
    yaricap: 0.383,
    a: 0.387, e: 0.2056, egim: 7.0, dugum: 48.33, enberi: 77.46, L0: 252.25,
    yil: 87.969,
    gun: 58.646,
    egiklik: 0.03,
    kabartma: true,
    aciklama:
      'Güneş\'e en yakın ve en küçük gezegen. Neredeyse hiç atmosferi olmadığından ısıyı tutamaz: gündüzleri kurşunu eritecek kadar sıcak, geceleri ise dondurucu soğuktur.',
    veriler: [
      ['Çap', '4.879 km'],
      ['Güneş\'e uzaklık', '57,9 milyon km · 0,39 AB'],
      ['Bir günü (dönüş)', '58,6 Dünya günü'],
      ['Bir yılı', '88 Dünya günü'],
      ['Uydu sayısı', '0'],
      ['Sıcaklık', '−180 °C / 430 °C'],
      ['Yerçekimi', '3,7 m/s²'],
    ],
    bilgiler: [
      'Güneş\'in iki doğuşu arası 176 Dünya günü sürer; yani Merkür\'de bir "gün", iki Merkür yılı kadar uzundur.',
      'Sistemin en hızlı gezegenidir: yörüngesinde saniyede yaklaşık 47 km yol alır.',
      'Kutuplarındaki sürekli gölgede kalan kraterlerde su buzu bulunduğuna dair güçlü kanıtlar vardır.',
    ],
  },
  {
    id: 'venus',
    ad: 'Venüs',
    tur: 'Karasal gezegen',
    renkler: ['#f1d9a4', '#b98a3f'],
    doku: '2k_venus_atmosphere.jpg',
    yaricap: 0.949,
    a: 0.723, e: 0.0068, egim: 3.39, dugum: 76.68, enberi: 131.53, L0: 181.98,
    yil: 224.701,
    gun: 243.02,
    // Görünen yüzey bulut tabakasıdır; bulutlar gezegenin çevresini yaklaşık 4 günde
    // dolanır (süper rotasyon). Görsel dönüş için bu değer kullanılır.
    gorselGun: 4.2,
    egiklik: 177.36,
    atmosfer: { renk: '#ffd591', kalinlik: 1.14, siddet: 0.85 },
    aciklama:
      'Boyutuyla Dünya\'nın ikizi, koşullarıyla tam tersi. Kalın karbondioksit atmosferi ve sülfürik asit bulutları ısıyı öyle hapseder ki yüzeyi Merkür\'den bile sıcaktır. Burada gördüğün, yüzeyi tamamen örten bulut tabakasıdır.',
    veriler: [
      ['Çap', '12.104 km'],
      ['Güneş\'e uzaklık', '108,2 milyon km · 0,72 AB'],
      ['Bir günü (dönüş)', '243 Dünya günü, ters yönde'],
      ['Bir yılı', '224,7 Dünya günü'],
      ['Uydu sayısı', '0'],
      ['Ortalama sıcaklık', '464 °C'],
      ['Yerçekimi', '8,87 m/s²'],
    ],
    bilgiler: [
      'Kendi ekseninde bir turu, Güneş çevresindeki turundan uzun sürer: günü yılından uzundur.',
      'Diğer gezegenlerin çoğunun tersine döner; Venüs\'te Güneş batıdan doğar.',
      'Yüzey basıncı Dünya\'dakinin yaklaşık 92 katıdır; bu, okyanusun 900 metre derinliğindeki basınca denktir.',
    ],
  },
  {
    id: 'dunya',
    ad: 'Dünya',
    tur: 'Karasal gezegen',
    renkler: ['#7db8ff', '#1f4f9c'],
    doku: '2k_earth_daymap.jpg',
    ozel: 'dunya',
    yaricap: 1,
    a: 1.0, e: 0.0167, egim: 0.0, dugum: 0.0, enberi: 102.95, L0: 100.46,
    yil: 365.256,
    gun: 0.99727,
    egiklik: 23.44,
    atmosfer: { renk: '#5aa2ff', kalinlik: 1.13, siddet: 0.95 },
    aciklama:
      'Yüzeyinde sıvı su bulunduğu ve yaşam barındırdığı bilinen tek gezegen. Yüzeyinin yüzde 71\'i okyanuslarla kaplıdır; ince atmosferi ve manyetik alanı onu Güneş\'in zararlı ışınımından korur.',
    veriler: [
      ['Çap', '12.742 km'],
      ['Güneş\'e uzaklık', '149,6 milyon km · 1 AB'],
      ['Bir günü', '23 sa 56 dk'],
      ['Bir yılı', '365,25 gün'],
      ['Uydu sayısı', '1'],
      ['Ortalama sıcaklık', '15 °C'],
      ['Yerçekimi', '9,81 m/s²'],
    ],
    bilgiler: [
      'Mevsimlerin nedeni Güneş\'e uzaklık değil, eksenin 23,4 derecelik eğikliğidir.',
      'Karasal gezegenlerin en büyüğü ve en yoğunudur.',
      'Gece tarafına yaklaş: şehir ışıklarını görebilirsin.',
    ],
    uydular: [
      {
        id: 'ay',
        ad: 'Ay',
        tur: 'Doğal uydu · Dünya',
        renkler: ['#e2e2e2', '#77777b'],
        doku: '2k_moon.jpg',
        ton: '#ffffff',
        yaricap: 0.2727,
        uzaklik: 3.5,
        periyot: 27.32,
        duzlemEgim: 5.14,
        kabartma: true,
        aciklama:
          'Dünya\'nın tek doğal uydusu ve insanın ayak bastığı tek gök cismi. Büyük olasılıkla 4,5 milyar yıl önce, Mars büyüklüğünde bir cismin genç Dünya\'ya çarpmasıyla saçılan maddeden oluştu.',
        veriler: [
          ['Çap', '3.474 km'],
          ['Dünya\'ya uzaklık', '384.400 km'],
          ['Bir günü (dönüş)', '27,3 Dünya günü'],
          ['Dünya çevresinde tur', '27,3 gün'],
          ['Evre döngüsü', '29,5 gün'],
          ['Sıcaklık', '−173 °C / 127 °C'],
          ['Yerçekimi', '1,62 m/s²'],
        ],
        bilgiler: [
          'Dönüşü yörüngesiyle kilitlidir; bu yüzden Dünya\'dan hep aynı yüzünü görürüz.',
          'Her yıl Dünya\'dan yaklaşık 3,8 santimetre uzaklaşır.',
          'Gelgitlerin başlıca nedeni Ay\'ın kütle çekimidir.',
        ],
      },
    ],
  },
  {
    id: 'mars',
    ad: 'Mars',
    tur: 'Karasal gezegen',
    renkler: ['#f0a070', '#9c3d1e'],
    doku: '2k_mars.jpg',
    yaricap: 0.532,
    a: 1.524, e: 0.0934, egim: 1.85, dugum: 49.56, enberi: 336.04, L0: 355.45,
    yil: 686.98,
    gun: 1.02596,
    egiklik: 25.19,
    kabartma: true,
    atmosfer: { renk: '#ff8a5c', kalinlik: 1.07, siddet: 0.42 },
    aciklama:
      'Rengini yüzeyindeki demir oksitten, yani pastan alan Kızıl Gezegen. Bugün soğuk ve kuru bir çöl; ancak kurumuş nehir yatakları ve deltalar, bir zamanlar yüzeyinde su aktığını gösteriyor.',
    veriler: [
      ['Çap', '6.779 km'],
      ['Güneş\'e uzaklık', '227,9 milyon km · 1,52 AB'],
      ['Bir günü', '24 sa 37 dk'],
      ['Bir yılı', '687 Dünya günü'],
      ['Uydu sayısı', '2'],
      ['Ortalama sıcaklık', '−63 °C'],
      ['Yerçekimi', '3,72 m/s²'],
    ],
    bilgiler: [
      'Olympus Mons yaklaşık 22 km yüksekliğiyle Güneş Sistemi\'nin bilinen en yüksek yanardağıdır.',
      'Valles Marineris kanyon sistemi 4.000 km\'yi aşar; Türkiye\'nin doğu-batı uzunluğunun iki katından fazladır.',
      'Atmosferi Dünya\'nınkinin yüzde biri kadar yoğundur ve çoğunlukla karbondioksittir.',
    ],
    uydular: [
      {
        id: 'phobos',
        ad: 'Phobos',
        tur: 'Doğal uydu · Mars',
        renkler: ['#a8998b', '#4f463e'],
        doku: '2k_moon.jpg',
        ton: '#9a8676',
        yaricap: 0.00174,
        uzaklik: 1.45,
        periyot: 0.3189,
        bicim: [1.0, 0.8, 0.72],
        aciklama:
          'Mars\'ın iki küçük uydusundan büyük ve yakın olanı. Patates biçimli bu kaya parçası, gezegenine o kadar yakın döner ki bir Mars gününde gökyüzünü iki kereden fazla kat eder.',
        veriler: [
          ['Boyut', '27 × 22 × 18 km'],
          ['Mars\'a uzaklık', '9.376 km (merkezden)'],
          ['Mars çevresinde tur', '7 sa 39 dk'],
          ['Ortalama sıcaklık', '≈ −40 °C'],
          ['Yerçekimi', '0,006 m/s²'],
        ],
        bilgiler: [
          'Her yüzyılda Mars\'a yaklaşık 1,8 metre yaklaşır; on milyonlarca yıl içinde parçalanıp bir halka oluşturması bekleniyor.',
          'Mars yüzeyinden bakıldığında batıdan doğar, doğudan batar.',
        ],
      },
      {
        id: 'deimos',
        ad: 'Deimos',
        tur: 'Doğal uydu · Mars',
        renkler: ['#b5a899', '#5a5148'],
        doku: '2k_moon.jpg',
        ton: '#a89886',
        yaricap: 0.00097,
        uzaklik: 2.25,
        periyot: 1.263,
        bicim: [1.0, 0.82, 0.7],
        aciklama:
          'Mars\'ın küçük ve uzak uydusu. Yüzeyi kalın bir toz tabakasıyla örtülü olduğundan Phobos\'a göre daha pürüzsüz görünür.',
        veriler: [
          ['Boyut', '15 × 12 × 11 km'],
          ['Mars\'a uzaklık', '23.460 km (merkezden)'],
          ['Mars çevresinde tur', '30,3 saat'],
          ['Ortalama sıcaklık', '≈ −40 °C'],
          ['Yerçekimi', '0,003 m/s²'],
        ],
        bilgiler: [
          'Mars\'tan bakıldığında parlak bir yıldızdan pek farklı görünmez.',
          'Kaçış hızı o kadar düşüktür ki iyi bir sıçrayışla yörüngeye çıkabilirsin: saniyede yaklaşık 5,6 metre.',
        ],
      },
    ],
  },
  {
    id: 'jupiter',
    ad: 'Jüpiter',
    tur: 'Gaz devi',
    renkler: ['#e8c9a0', '#a8683a'],
    doku: '2k_jupiter.jpg',
    yaricap: 10.97,
    basiklik: 0.065,
    a: 5.203, e: 0.0484, egim: 1.3, dugum: 100.46, enberi: 14.75, L0: 34.4,
    yil: 4332.59,
    gun: 0.41354,
    egiklik: 3.13,
    atmosfer: { renk: '#f2d2a6', kalinlik: 1.05, siddet: 0.34 },
    aciklama:
      'Güneş Sistemi\'nin açık ara en büyük gezegeni: diğer bütün gezegenlerin toplamından iki buçuk kat daha kütleli. Katı bir yüzeyi yoktur; gördüğün kuşaklar, saatte yüzlerce kilometre hızla esen rüzgârların sürüklediği bulutlardır.',
    veriler: [
      ['Çap', '139.820 km'],
      ['Güneş\'e uzaklık', '778,5 milyon km · 5,20 AB'],
      ['Bir günü', '9 sa 56 dk'],
      ['Bir yılı', '11,86 Dünya yılı'],
      ['Uydu sayısı', 'en az 95'],
      ['Bulut tepesi sıcaklığı', '−110 °C'],
      ['Yerçekimi', '24,79 m/s²'],
    ],
    bilgiler: [
      'Büyük Kırmızı Leke, Dünya\'dan büyük bir fırtınadır ve en az 190 yıldır aralıksız gözleniyor.',
      'Sistemin en kısa günü ondadır: bu dev küre kendi çevresinde 10 saatten kısa sürede döner.',
      'İçine 1.300\'den fazla Dünya sığar.',
    ],
    uydular: [
      {
        id: 'io',
        ad: 'Io',
        tur: 'Galileo uydusu · Jüpiter',
        renkler: ['#f3e08a', '#b98f2b'],
        doku: '2k_moon.jpg',
        ton: '#f0d66a',
        yaricap: 0.2859,
        uzaklik: 6.0,
        periyot: 1.769,
        aciklama:
          'Güneş Sistemi\'nin volkanik olarak en etkin cismi. Jüpiter\'in ve komşu uyduların çekimi içini sürekli yoğurup ısıtır; yüzeyinde yüzlerce etkin yanardağ vardır.',
        veriler: [
          ['Çap', '3.643 km'],
          ['Jüpiter\'e uzaklık', '421.700 km'],
          ['Jüpiter çevresinde tur', '1,77 gün'],
          ['Ortalama sıcaklık', '≈ −130 °C'],
          ['Yerçekimi', '1,80 m/s²'],
        ],
        bilgiler: [
          'Sarı-turuncu rengini kükürt bileşiklerinden alır.',
          'Bazı püskürmeleri yüzeyden 400 km yükseğe ulaşır.',
        ],
      },
      {
        id: 'europa',
        ad: 'Europa',
        tur: 'Galileo uydusu · Jüpiter',
        renkler: ['#efe6d6', '#9c8a72'],
        doku: '2k_moon.jpg',
        ton: '#e9dcc6',
        yaricap: 0.245,
        uzaklik: 7.5,
        periyot: 3.551,
        aciklama:
          'Buz kabuğunun altında, Dünya\'daki bütün okyanusların toplamından fazla su barındırdığı düşünülen bir uydu. Dünya dışı yaşam arayışının en güçlü adaylarından biridir.',
        veriler: [
          ['Çap', '3.122 km'],
          ['Jüpiter\'e uzaklık', '671.000 km'],
          ['Jüpiter çevresinde tur', '3,55 gün'],
          ['Ortalama sıcaklık', '≈ −160 °C'],
          ['Yerçekimi', '1,31 m/s²'],
        ],
        bilgiler: [
          'Yüzeyi Güneş Sistemi\'nin en pürüzsüz yüzeylerinden biridir; neredeyse hiç dağ ya da derin krater yoktur.',
          'NASA\'nın Europa Clipper aracı 2024\'te bu uyduyu incelemek üzere yola çıktı.',
        ],
      },
      {
        id: 'ganymede',
        ad: 'Ganymede',
        tur: 'Galileo uydusu · Jüpiter',
        renkler: ['#c9bfb2', '#6d6359'],
        doku: '2k_moon.jpg',
        ton: '#b9ad9f',
        yaricap: 0.4135,
        uzaklik: 9.3,
        periyot: 7.155,
        aciklama:
          'Güneş Sistemi\'nin en büyük uydusu; Merkür gezegeninden bile büyüktür. Kendi manyetik alanına sahip olduğu bilinen tek uydudur.',
        veriler: [
          ['Çap', '5.268 km'],
          ['Jüpiter\'e uzaklık', '1.070.400 km'],
          ['Jüpiter çevresinde tur', '7,15 gün'],
          ['Ortalama sıcaklık', '≈ −160 °C'],
          ['Yerçekimi', '1,43 m/s²'],
        ],
        bilgiler: [
          'Güneş\'in çevresinde dönseydi rahatlıkla gezegen sayılırdı.',
          'Buz kabuğunun altında tuzlu bir okyanus bulunduğuna dair kanıtlar vardır.',
        ],
      },
      {
        id: 'callisto',
        ad: 'Callisto',
        tur: 'Galileo uydusu · Jüpiter',
        renkler: ['#9a8f82', '#453d35'],
        doku: '2k_moon.jpg',
        ton: '#85796c',
        yaricap: 0.3783,
        uzaklik: 11.6,
        periyot: 16.689,
        aciklama:
          'Güneş Sistemi\'nin en yoğun kraterli cisimlerinden biri. Yüzeyi milyarlarca yıldır neredeyse hiç değişmemiştir; adeta sistemin ilk dönemlerinden kalma bir fosildir.',
        veriler: [
          ['Çap', '4.821 km'],
          ['Jüpiter\'e uzaklık', '1.882.700 km'],
          ['Jüpiter çevresinde tur', '16,7 gün'],
          ['Ortalama sıcaklık', '≈ −140 °C'],
          ['Yerçekimi', '1,24 m/s²'],
        ],
        bilgiler: [
          'Jüpiter\'in yoğun radyasyon kuşaklarının dışında kaldığı için, gelecekteki insanlı üsler için aday gösterilir.',
          'Valhalla çarpma havzasının halkaları yaklaşık 3.800 km genişliğe yayılır.',
        ],
      },
    ],
  },
  {
    id: 'saturn',
    ad: 'Satürn',
    tur: 'Gaz devi',
    renkler: ['#f0dcae', '#b39256'],
    doku: '2k_saturn.jpg',
    ozel: 'saturn',
    yaricap: 9.14,
    basiklik: 0.098,
    a: 9.537, e: 0.0542, egim: 2.49, dugum: 113.67, enberi: 92.43, L0: 49.94,
    yil: 10759.22,
    gun: 0.444,
    egiklik: 26.73,
    atmosfer: { renk: '#f5e2b0', kalinlik: 1.05, siddet: 0.3 },
    halka: { ic: 1.24, dis: 2.33, doku: '2k_saturn_ring_alpha.png' },
    aciklama:
      'Görkemli halkalarıyla sistemin mücevheri. Halkalar toz tanesinden ev büyüklüğüne kadar değişen sayısız buz ve kaya parçasından oluşur; 280.000 km genişliğe yayılmalarına karşın çoğu yerde kalınlıkları onlarca metreyi geçmez.',
    veriler: [
      ['Çap', '116.460 km'],
      ['Güneş\'e uzaklık', '1.434 milyon km · 9,58 AB'],
      ['Bir günü', '10 sa 33 dk'],
      ['Bir yılı', '29,45 Dünya yılı'],
      ['Uydu sayısı', '274 (2025)'],
      ['Bulut tepesi sıcaklığı', '−140 °C'],
      ['Yerçekimi', '10,44 m/s²'],
    ],
    bilgiler: [
      'Ortalama yoğunluğu sudan düşüktür; yeterince büyük bir okyanus olsaydı Satürn üzerinde yüzerdi.',
      'Kuzey kutbunda, her kenarı Dünya\'dan uzun olan altıgen biçimli dev bir fırtına döner.',
      'Halkanın gezegene, gezegenin de halkaya düşen gölgesine dikkat et.',
    ],
    uydular: [
      {
        id: 'titan',
        ad: 'Titan',
        tur: 'Doğal uydu · Satürn',
        renkler: ['#f0bd6a', '#a8691f'],
        doku: '2k_venus_atmosphere.jpg',
        ton: '#f2b45a',
        yaricap: 0.4037,
        uzaklik: 11.4,
        periyot: 15.945,
        atmosfer: { renk: '#ffb459', kalinlik: 1.14, siddet: 0.6 },
        aciklama:
          'Kalın bir atmosfere sahip tek uydu ve Dünya dışında yüzeyinde kalıcı sıvı bulunduğu bilinen tek cisim. Ancak göllerini ve denizlerini su değil, sıvı metan ve etan doldurur.',
        veriler: [
          ['Çap', '5.150 km'],
          ['Satürn\'e uzaklık', '1.221.870 km'],
          ['Satürn çevresinde tur', '15,95 gün'],
          ['Yüzey sıcaklığı', '−179 °C'],
          ['Yerçekimi', '1,35 m/s²'],
        ],
        bilgiler: [
          'Atmosferi o kadar yoğun, yerçekimi o kadar düşüktür ki kollarına kanat takan bir insan burada uçabilirdi.',
          'Huygens sondası 2005\'te Titan\'a indi; bu, dış Güneş Sistemi\'ndeki ilk iniştir.',
        ],
      },
    ],
  },
  {
    id: 'uranus',
    ad: 'Uranüs',
    tur: 'Buz devi',
    renkler: ['#c4f0f2', '#5fa9b5'],
    doku: '2k_uranus.jpg',
    ozel: 'uranus',
    yaricap: 3.98,
    basiklik: 0.023,
    a: 19.19, e: 0.0472, egim: 0.77, dugum: 74.01, enberi: 170.96, L0: 313.23,
    yil: 30688.5,
    gun: 0.71833,
    egiklik: 97.77,
    atmosfer: { renk: '#9fe8ee', kalinlik: 1.07, siddet: 0.5 },
    aciklama:
      'Yan yatmış gezegen. Ekseni yörünge düzlemine neredeyse paralel olduğundan Güneş\'in çevresinde yuvarlanarak ilerler gibidir. Soluk camgöbeği rengini, atmosferindeki metanın kırmızı ışığı soğurmasına borçludur.',
    veriler: [
      ['Çap', '50.724 km'],
      ['Güneş\'e uzaklık', '2.871 milyon km · 19,2 AB'],
      ['Bir günü', '17 sa 14 dk, ters yönde'],
      ['Bir yılı', '84 Dünya yılı'],
      ['Uydu sayısı', 'en az 28'],
      ['Bulut tepesi sıcaklığı', '−195 °C'],
      ['Yerçekimi', '8,69 m/s²'],
    ],
    bilgiler: [
      'Eğikliği yüzünden kutuplarında 42 yıl gündüz, ardından 42 yıl gece yaşanır.',
      '1781\'de William Herschel tarafından bulundu; teleskopla keşfedilen ilk gezegendir.',
      'İnce ve karanlık 13 halkası vardır; burada çok soluk biçimde gösterilmiştir.',
    ],
  },
  {
    id: 'neptun',
    ad: 'Neptün',
    tur: 'Buz devi',
    renkler: ['#7fa4ff', '#2a45b0'],
    doku: '2k_neptune.jpg',
    yaricap: 3.86,
    basiklik: 0.017,
    a: 30.07, e: 0.0086, egim: 1.77, dugum: 131.78, enberi: 44.97, L0: 304.88,
    yil: 60182,
    gun: 0.6713,
    egiklik: 28.32,
    atmosfer: { renk: '#5f86ff', kalinlik: 1.07, siddet: 0.55 },
    aciklama:
      'Güneş\'e en uzak gezegen: karanlık, soğuk ve fırtınalı. Güneş ışığı buraya Dünya\'dakinden 900 kat daha zayıf ulaşır; buna karşın atmosferinde sistemin en hızlı rüzgârları eser.',
    veriler: [
      ['Çap', '49.244 km'],
      ['Güneş\'e uzaklık', '4.495 milyon km · 30,1 AB'],
      ['Bir günü', '16 sa 6 dk'],
      ['Bir yılı', '164,8 Dünya yılı'],
      ['Uydu sayısı', '16'],
      ['Bulut tepesi sıcaklığı', '−200 °C'],
      ['Yerçekimi', '11,15 m/s²'],
    ],
    bilgiler: [
      'Rüzgârları saatte 2.000 km\'yi aşar; ses hızından hızlıdır.',
      'Gözlemle değil, matematiksel hesapla bulunan ilk gezegendir (1846).',
      'Keşfinden bu yana Güneş çevresindeki ilk tam turunu ancak 2011\'de tamamladı.',
    ],
  },
];

/** Menüde ve turda kullanılan ana sıra: Güneş + 8 gezegen. */
export const ANA_SIRA = GOVDELER.map((g) => g.id);

/** Kimlikten veri kaydına (uydular dâhil) hızlı erişim. */
export const VERI = new Map();
for (const g of GOVDELER) {
  VERI.set(g.id, g);
  for (const u of g.uydular || []) {
    u.ebeveynId = g.id;
    VERI.set(u.id, u);
  }
}
