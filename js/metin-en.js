// ---------------------------------------------------------------------------
// İngilizce metinler (yapı metin-tr.js ile birebir aynıdır)
//   ARAYUZ : arayüz dizgileri, GOVDE : gövde kimliği → metinler
// Kimlikler Türkçedir ve çevrilmez. Sayılar İngilizce biçimdedir:
// ondalık nokta, binlik virgül.
// ---------------------------------------------------------------------------

export const ARAYUZ = {
  // Sayfa
  'sayfa.baslik': 'Solar System',
  'sayfa.aciklama': 'An interactive 3D Solar System you can explore in your browser.',
  'marka.ad': 'Solar System',
  'marka.alt': 'Interactive 3D explorer',
  'sahne.aria': '3D view of the Solar System',
  'kaynak': 'Textures: Solar System Scope (CC BY 4.0) · Three.js',

  // Yükleme
  'yukleme.dokular': 'Loading textures…',
  'yukleme.ilerleme': 'Loading textures… {yuzde}%',
  'yukleme.hata': 'Failed to load: {url}',
  'yukleme.hazir': 'Ready',

  // Zaman denetimi
  'zaman.aria': 'Time controls',
  'oynat.baslik': 'Pause / play (Space)',
  'oynat.duraklat': 'Pause',
  'oynat.oynat': 'Play',
  'hiz.aria': 'Simulation speed',
  'hiz.saat': '{n} h/s',
  'hiz.gun': '{n} days/s',
  'hiz.yil': '{n} years/s',
  'sure.baslik': 'Simulated time elapsed',
  'sure.gun': '{gun} d',
  'sure.yilGun': '{yil} yr {gun} d',

  // Üst düğmeler
  'denetimler.aria': 'View controls',
  'tur.yazi': 'Tour',
  'tur.aria': 'Guided tour',
  'tur.baslatBaslik': 'Start tour (T)',
  'tur.durdurBaslik': 'Stop tour (T)',
  'yorunge.baslik': 'Orbits (O)',
  'yorunge.aria': 'Show orbits',
  'etiket.baslik': 'Labels (L)',
  'etiket.aria': 'Show labels',
  'genel.baslik': 'Overview (Esc)',
  'genel.aria': 'Overview',
  'tamekran': 'Full screen',
  'yardim.dugme': 'Keyboard shortcuts',
  'dil.baslik': 'Language / Dil',
  'dil.aria': 'Language: English. Switch to Turkish',

  // İpuçları
  'ipucu.acilis': '<b>Drag:</b> rotate · <b>Scroll:</b> zoom · <b>Click:</b> fly to a planet',
  'ipucu.acilisDokunmatik': '<b>Drag:</b> rotate · <b>Pinch:</b> zoom · <b>Tap:</b> fly to a planet',
  'ipucu.tur': '<b>Tour</b> · {ad} · {sira}/{toplam} — click or press any key to stop',

  // Bilgi paneli
  'panel.aria': 'Details',
  'panel.onceki': 'Previous object',
  'panel.oncekiBaslik': 'Previous (←)',
  'panel.sonraki': 'Next object',
  'panel.sonrakiBaslik': 'Next (→)',
  'panel.kapat': 'Close panel',
  'panel.kapatBaslik': 'Close',
  'panel.bilgiler': 'Did you know?',
  'panel.buyukUydular': 'Major moons',
  'panel.uydusu': 'Moon',
  'panel.gezegeni': 'Planet',

  // Menü
  'menu.aria': 'Sun and planets',

  // Yardım penceresi
  'yardim.baslik': 'Shortcuts',
  'yardim.kapat': 'Close',
  'yardim.gunes': 'The Sun',
  'yardim.gezegenler': 'Planets (Mercury → Neptune)',
  'yardim.komsu': 'Previous / next object',
  'yardim.bosluk': 'Space',
  'yardim.duraklat': 'Pause / play',
  'yardim.genel': 'Overview',
  'yardim.yorunge': 'Show / hide orbits',
  'yardim.etiket': 'Show / hide labels',
  'yardim.tur': 'Start / stop tour',
  'yardim.not': 'Drag: rotate · Scroll wheel or two fingers: zoom · Right-drag: pan · Click: fly to a planet',

  // Hatalar
  'hata.genel': 'Something went wrong',
  'hata.webglYokBaslik': 'WebGL is not available',
  'hata.webglYokMetin':
    'This experience needs an up-to-date browser and graphics driver with WebGL support. Try updating your browser or turning on hardware acceleration.',
  'hata.webglBaslatBaslik': 'Could not start WebGL',
  'hata.webglBaslatMetin':
    'The graphics context could not be created. Make sure hardware acceleration is turned on in your browser, then reload the page.',
};

export const GOVDE = {
  gunes: {
    ad: 'Sun',
    tur: 'Star · G2V yellow dwarf',
    aciklama:
      'The heart of the Solar System, holding 99.86 percent of its mass. Every second its core turns about 600 million tonnes of hydrogen into helium; the energy released lights up every planet and makes life on Earth possible.',
    veriler: [
      ['Diameter', '1,392,700 km'],
      ['Distance from Earth', '149.6 million km · 1 AU'],
      ['Rotation at equator', '≈ 25 days'],
      ['Orbit of the galaxy', '≈ 230 million years'],
      ['Planets', '8'],
      ['Surface temperature', '≈ 5,500 °C'],
      ['Surface gravity', '274 m/s²'],
      ['Age', '≈ 4.6 billion years'],
    ],
    bilgiler: [
      'About 1.3 million Earths would fit inside the Sun.',
      'Its light takes 8 minutes 20 seconds to reach Earth, so the Sun you see in the sky is how it looked eight minutes ago.',
      'Its core is about 15 million °C, yet its outer atmosphere, the corona, is surprisingly hundreds of times hotter than the surface.',
    ],
  },

  merkur: {
    ad: 'Mercury',
    tur: 'Terrestrial planet',
    aciklama:
      'The smallest planet and the closest to the Sun. With almost no atmosphere it cannot hold on to heat: its days are hot enough to melt lead, its nights bitterly cold.',
    veriler: [
      ['Diameter', '4,879 km'],
      ['Distance from the Sun', '57.9 million km · 0.39 AU'],
      ['Day (rotation)', '58.6 Earth days'],
      ['Year', '88 Earth days'],
      ['Moons', '0'],
      ['Temperature', '−180 °C / 430 °C'],
      ['Gravity', '3.7 m/s²'],
    ],
    bilgiler: [
      'From one sunrise to the next takes 176 Earth days, so a Mercury "day" lasts as long as two Mercury years.',
      'It is the fastest planet, racing along its orbit at about 47 km per second.',
      'There is strong evidence of water ice in polar craters that never see sunlight.',
    ],
  },

  venus: {
    ad: 'Venus',
    tur: 'Terrestrial planet',
    aciklama:
      'Earth\'s twin in size, its opposite in every other way. A thick carbon dioxide atmosphere and clouds of sulfuric acid trap so much heat that its surface is even hotter than Mercury\'s. What you see here is the cloud layer that hides the surface completely.',
    veriler: [
      ['Diameter', '12,104 km'],
      ['Distance from the Sun', '108.2 million km · 0.72 AU'],
      ['Day (rotation)', '243 Earth days, retrograde'],
      ['Year', '224.7 Earth days'],
      ['Moons', '0'],
      ['Average temperature', '464 °C'],
      ['Gravity', '8.87 m/s²'],
    ],
    bilgiler: [
      'One spin on its axis takes longer than one trip around the Sun: its day is longer than its year.',
      'It spins the opposite way to most planets, so on Venus the Sun rises in the west.',
      'The surface pressure is about 92 times Earth\'s, the same as 900 metres down in the ocean.',
    ],
  },

  dunya: {
    ad: 'Earth',
    tur: 'Terrestrial planet',
    aciklama:
      'The only planet known to have liquid water on its surface and to harbour life. Oceans cover 71 percent of its surface; a thin atmosphere and a magnetic field shield it from the Sun\'s harmful radiation.',
    veriler: [
      ['Diameter', '12,742 km'],
      ['Distance from the Sun', '149.6 million km · 1 AU'],
      ['Day', '23 h 56 min'],
      ['Year', '365.25 days'],
      ['Moons', '1'],
      ['Average temperature', '15 °C'],
      ['Gravity', '9.81 m/s²'],
    ],
    bilgiler: [
      'The seasons come not from our distance to the Sun but from the 23.4-degree tilt of Earth\'s axis.',
      'It is the largest and densest of the terrestrial planets.',
      'Move round to the night side and you can see the city lights.',
    ],
  },

  ay: {
    ad: 'Moon',
    tur: 'Natural satellite · Earth',
    aciklama:
      'Earth\'s only natural satellite and the only world beyond Earth where humans have set foot. It most likely formed 4.5 billion years ago from debris thrown out when a Mars-sized body slammed into the young Earth.',
    veriler: [
      ['Diameter', '3,474 km'],
      ['Distance from Earth', '384,400 km'],
      ['Day (rotation)', '27.3 Earth days'],
      ['Orbit around Earth', '27.3 days'],
      ['Phase cycle', '29.5 days'],
      ['Temperature', '−173 °C / 127 °C'],
      ['Gravity', '1.62 m/s²'],
    ],
    bilgiler: [
      'Its rotation is locked to its orbit, which is why we always see the same face from Earth.',
      'It drifts about 3.8 centimetres farther from Earth every year.',
      'The Moon\'s gravity is the main cause of the tides.',
    ],
  },

  mars: {
    ad: 'Mars',
    tur: 'Terrestrial planet',
    aciklama:
      'The Red Planet owes its colour to iron oxide, or rust, on its surface. Today it is a cold, dry desert, but dried-up riverbeds and deltas show that water once flowed across it.',
    veriler: [
      ['Diameter', '6,779 km'],
      ['Distance from the Sun', '227.9 million km · 1.52 AU'],
      ['Day', '24 h 37 min'],
      ['Year', '687 Earth days'],
      ['Moons', '2'],
      ['Average temperature', '−63 °C'],
      ['Gravity', '3.72 m/s²'],
    ],
    bilgiler: [
      'At about 22 km high, Olympus Mons is the tallest known volcano in the Solar System.',
      'The Valles Marineris canyon system runs for more than 4,000 km, over twice the east–west length of Turkey.',
      'Its atmosphere is only about one percent as dense as Earth\'s and is mostly carbon dioxide.',
    ],
  },

  phobos: {
    ad: 'Phobos',
    tur: 'Natural satellite · Mars',
    aciklama:
      'The larger and closer of Mars\'s two small moons. This potato-shaped lump of rock orbits so close to its planet that it crosses the sky more than twice in a single Martian day.',
    veriler: [
      ['Size', '27 × 22 × 18 km'],
      ['Distance from Mars', '9,376 km (from centre)'],
      ['Orbit around Mars', '7 h 39 min'],
      ['Average temperature', '≈ −40 °C'],
      ['Gravity', '0.006 m/s²'],
    ],
    bilgiler: [
      'It creeps about 1.8 metres closer to Mars every century; within tens of millions of years it is expected to break apart and form a ring.',
      'Seen from the surface of Mars, it rises in the west and sets in the east.',
    ],
  },

  deimos: {
    ad: 'Deimos',
    tur: 'Natural satellite · Mars',
    aciklama:
      'The smaller and more distant moon of Mars. A thick blanket of dust covers its surface, so it looks smoother than Phobos.',
    veriler: [
      ['Size', '15 × 12 × 11 km'],
      ['Distance from Mars', '23,460 km (from centre)'],
      ['Orbit around Mars', '30 h 18 min'],
      ['Average temperature', '≈ −40 °C'],
      ['Gravity', '0.003 m/s²'],
    ],
    bilgiler: [
      'From Mars it looks little different from a bright star.',
      'Its escape velocity is so low (about 5.6 metres per second) that someone taking a good running jump could break free of Deimos and drift off into space.',
    ],
  },

  jupiter: {
    ad: 'Jupiter',
    tur: 'Gas giant',
    aciklama:
      'By far the largest planet in the Solar System, two and a half times as massive as all the other planets combined. It has no solid surface; the bands you see are clouds swept along by winds of hundreds of kilometres per hour.',
    veriler: [
      ['Diameter', '139,820 km'],
      ['Distance from the Sun', '778.5 million km · 5.20 AU'],
      ['Day', '9 h 56 min'],
      ['Year', '11.86 Earth years'],
      ['Moons', '115 (2026)'],
      ['Cloud-top temperature', '−110 °C'],
      ['Gravity', '24.79 m/s²'],
    ],
    bilgiler: [
      'The Great Red Spot is a storm bigger than Earth that has been watched continuously for at least 190 years.',
      'It has the shortest day of any planet: this giant globe spins once in under 10 hours.',
      'More than 1,300 Earths would fit inside it.',
    ],
  },

  io: {
    ad: 'Io',
    tur: 'Galilean moon · Jupiter',
    aciklama:
      'The most volcanically active body in the Solar System. The pull of Jupiter and its neighbouring moons constantly kneads and heats its interior, and hundreds of active volcanoes dot its surface.',
    veriler: [
      ['Diameter', '3,643 km'],
      ['Distance from Jupiter', '421,700 km'],
      ['Orbit around Jupiter', '1.77 days'],
      ['Average temperature', '≈ −130 °C'],
      ['Gravity', '1.80 m/s²'],
    ],
    bilgiler: [
      'Its yellow-orange colour comes from sulfur compounds.',
      'Some of its eruptions reach 400 km above the surface.',
    ],
  },

  europa: {
    ad: 'Europa',
    tur: 'Galilean moon · Jupiter',
    aciklama:
      'A moon thought to hold more water beneath its icy shell than all of Earth\'s oceans combined. It is one of the strongest candidates in the search for life beyond Earth.',
    veriler: [
      ['Diameter', '3,122 km'],
      ['Distance from Jupiter', '671,000 km'],
      ['Orbit around Jupiter', '3.55 days'],
      ['Average temperature', '≈ −160 °C'],
      ['Gravity', '1.31 m/s²'],
    ],
    bilgiler: [
      'Its surface is one of the smoothest in the Solar System, with hardly any mountains or deep craters.',
      'NASA\'s Europa Clipper spacecraft set off in 2024 to study this moon.',
    ],
  },

  ganymede: {
    ad: 'Ganymede',
    tur: 'Galilean moon · Jupiter',
    aciklama:
      'The largest moon in the Solar System, bigger even than the planet Mercury. It is the only moon known to have its own magnetic field.',
    veriler: [
      ['Diameter', '5,268 km'],
      ['Distance from Jupiter', '1,070,400 km'],
      ['Orbit around Jupiter', '7.15 days'],
      ['Average temperature', '≈ −160 °C'],
      ['Gravity', '1.43 m/s²'],
    ],
    bilgiler: [
      'If it orbited the Sun on its own, it would easily count as a planet.',
      'There is evidence of a salty ocean beneath its icy crust.',
    ],
  },

  callisto: {
    ad: 'Callisto',
    tur: 'Galilean moon · Jupiter',
    aciklama:
      'One of the most heavily cratered bodies in the Solar System. Its surface has barely changed in billions of years, a fossil left over from the system\'s earliest days.',
    veriler: [
      ['Diameter', '4,821 km'],
      ['Distance from Jupiter', '1,882,700 km'],
      ['Orbit around Jupiter', '16.7 days'],
      ['Average temperature', '≈ −140 °C'],
      ['Gravity', '1.24 m/s²'],
    ],
    bilgiler: [
      'Because it lies outside Jupiter\'s intense radiation belts, it is often put forward as a site for future crewed bases.',
      'The rings of the Valhalla impact basin spread across some 3,800 km.',
    ],
  },

  saturn: {
    ad: 'Saturn',
    tur: 'Gas giant',
    aciklama:
      'The jewel of the system, crowned by its magnificent rings. They are made of countless pieces of ice and rock, from dust grains to chunks the size of a house; although they span 280,000 km, in most places they are no more than a few tens of metres thick.',
    veriler: [
      ['Diameter', '116,460 km'],
      ['Distance from the Sun', '1.43 billion km · 9.54 AU'],
      ['Day', '10 h 33 min'],
      ['Year', '29.45 Earth years'],
      ['Moons', '293 (2026)'],
      ['Cloud-top temperature', '−140 °C'],
      ['Gravity', '10.44 m/s²'],
    ],
    bilgiler: [
      'Its average density is lower than water\'s; given a big enough ocean, Saturn would float.',
      'Around its north pole flows a hexagon-shaped jet stream, each side longer than Earth\'s diameter, with a giant vortex at its centre.',
      'Look for the shadow the rings cast on the planet, and the one the planet casts on the rings.',
    ],
  },

  titan: {
    ad: 'Titan',
    tur: 'Natural satellite · Saturn',
    aciklama:
      'The only moon with a thick atmosphere, and the only body besides Earth known to have stable liquid on its surface. Its lakes and seas, however, are filled not with water but with liquid methane and ethane.',
    veriler: [
      ['Diameter', '5,150 km'],
      ['Distance from Saturn', '1,221,870 km'],
      ['Orbit around Saturn', '15.95 days'],
      ['Surface temperature', '−179 °C'],
      ['Gravity', '1.35 m/s²'],
    ],
    bilgiler: [
      'Its air is so dense and its gravity so weak that a person with wings strapped to their arms could fly here.',
      'The Huygens probe landed on Titan in 2005, the first landing in the outer Solar System.',
    ],
  },

  uranus: {
    ad: 'Uranus',
    tur: 'Ice giant',
    aciklama:
      'The planet that lies on its side. Its axis is tipped almost into the plane of its orbit, so it seems to roll its way around the Sun. Its pale cyan colour comes from methane in its atmosphere, which absorbs red light.',
    veriler: [
      ['Diameter', '50,724 km'],
      ['Distance from the Sun', '2.87 billion km · 19.2 AU'],
      ['Day', '17 h 14 min, retrograde'],
      ['Year', '84 Earth years'],
      ['Moons', '29 (2026)'],
      ['Cloud-top temperature', '−195 °C'],
      ['Gravity', '8.69 m/s²'],
    ],
    bilgiler: [
      'Because of its tilt, each pole gets 42 years of daylight followed by 42 years of night.',
      'William Herschel found it in 1781, making it the first planet discovered with a telescope.',
      'It has 13 thin, dark rings, shown here very faintly.',
    ],
  },

  neptun: {
    ad: 'Neptune',
    tur: 'Ice giant',
    aciklama:
      'The planet farthest from the Sun: dark, cold and stormy. Sunlight here is 900 times weaker than on Earth, yet its atmosphere has the fastest winds in the Solar System.',
    veriler: [
      ['Diameter', '49,244 km'],
      ['Distance from the Sun', '4.50 billion km · 30.1 AU'],
      ['Day', '16 h 6 min'],
      ['Year', '164.8 Earth years'],
      ['Moons', '16'],
      ['Cloud-top temperature', '−200 °C'],
      ['Gravity', '11.15 m/s²'],
    ],
    bilgiler: [
      'Its winds top 2,000 km/h, faster than the speed of sound.',
      'It was the first planet found by mathematical prediction rather than by observation (1846).',
      'It only completed its first full orbit of the Sun since its discovery in 2011.',
    ],
  },
};
