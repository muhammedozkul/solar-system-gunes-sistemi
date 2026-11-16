// ---------------------------------------------------------------------------
// Güneş Sistemi — ana modül
// Renderer, postprocessing, kamera uçuşları/takibi, zaman ve etkileşim.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { ANA_SIRA, VERI } from './data.js';
import { gunesSistemiKur } from './scene.js';
import { arayuzKur } from './ui.js';

const AZ_HAREKET = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const UCUS_SURESI = AZ_HAREKET ? 0.45 : 2.2; // sn
const ACILIS_SURESI = AZ_HAREKET ? 0.8 : 5.2; // sn
const TUR_BEKLEME = 8; // her gövdede kalınan süre (sn)

// Yüksek hızlarda kendi ekseninde dönüş ve uydu hareketi bulanık bir titremeye
// dönüşmesin diye bu iki saat sınırlı hızla ilerler (gün/sn).
const DONUS_HIZ_SINIRI = 0.12;
const UYDU_HIZ_SINIRI = 0.8;

const Y_EKSENI = new THREE.Vector3(0, 1, 0);

function webglVarMi() {
  try {
    const tuval = document.createElement('canvas');
    return !!(tuval.getContext('webgl2') || tuval.getContext('webgl'));
  } catch {
    return false;
  }
}

function yumusak(t) {
  // ease in-out (kübik)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function aciSarmala(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

if (location.protocol !== 'file:') basla();

function basla() {
  // ---- Durum --------------------------------------------------------------
  const durum = {
    duraklat: false,
    hiz: 5, // gün/sn
    odak: null, // izlenen gövde kaydı
    sonAci: 0, // odaktaki gövdenin Güneş çevresindeki son açısı
    ucus: null, // süren kamera uçuşu
    tur: null, // { sira, bekleme }
    yorungeler: true,
    etiketler: true,
    panelAcik: false,
    acilisIpucu: false,
  };

  const olaylar = {
    sec: (id) => odaklan(id),
    onceki: () => komsuyaGit(-1),
    sonraki: () => komsuyaGit(1),
    panelKapat: () => {
      durum.panelAcik = false;
      ui.panelGizle();
    },
    hiz: (deger) => {
      durum.hiz = deger;
    },
    duraklat: duraklatDegistir,
    tur: turDegistir,
    yorungeler: yorungeleriDegistir,
    etiketler: etiketleriDegistir,
    genelGorunum: () => genelGorunum(),
  };
  const ui = arayuzKur(olaylar);
  durum.hiz = ui.baslangicHizi();

  if (!webglVarMi()) {
    ui.hataGoster(
      'WebGL kullanılamıyor',
      'Bu deneyim için WebGL destekleyen güncel bir tarayıcı ve ekran kartı sürücüsü gerekir. Tarayıcını güncellemeyi ya da donanım hızlandırmayı açmayı dene.'
    );
    return;
  }

  // ---- Renderer -----------------------------------------------------------
  const kap = document.getElementById('sahne');
  let genislik = window.innerWidth;
  let yukseklik = window.innerHeight;
  const pikselOrani = Math.min(window.devicePixelRatio || 1, 2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  } catch {
    ui.hataGoster(
      'WebGL başlatılamadı',
      'Grafik bağlamı oluşturulamadı. Tarayıcında donanım hızlandırmanın açık olduğundan emin ol ve sayfayı yenile.'
    );
    return;
  }
  renderer.setPixelRatio(pikselOrani);
  renderer.setSize(genislik, yukseklik);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  kap.appendChild(renderer.domElement);

  const etiketRenderer = new CSS2DRenderer();
  etiketRenderer.setSize(genislik, yukseklik);
  etiketRenderer.domElement.className = 'etiket-katmani';
  kap.appendChild(etiketRenderer.domElement);

  const sahne = new THREE.Scene();
  sahne.background = new THREE.Color(0x000000);

  const kamera = new THREE.PerspectiveCamera(45, genislik / yukseklik, 0.1, 40000);
  kamera.position.set(-400, 620, 1000);
  kamera.lookAt(0, 0, 0);

  // ---- Postprocessing -----------------------------------------------------
  // Yarı kayan noktalı (HDR) hedef: yalnızca 1'in üstündeki değerler, yani Güneş,
  // bloom üretir; gezegenler yanıp patlamaz. Çoklu örnekleme kenarları yumuşatır.
  const hedef = new THREE.WebGLRenderTarget(genislik * pikselOrani, yukseklik * pikselOrani, {
    type: THREE.HalfFloatType,
    samples: pikselOrani > 1.5 ? 2 : 4,
  });
  const composer = new EffectComposer(renderer, hedef);
  composer.setPixelRatio(pikselOrani);
  composer.setSize(genislik, yukseklik);
  composer.addPass(new RenderPass(sahne, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(genislik, yukseklik), 0.5, 0.6, 1.0);
  // Eşik, parlaklık (luma) yerine en parlak renk kanalına bakar: turuncu Güneş'in
  // luması düşük olsa da kırmızı kanalı 1'in üstündedir; gezegenler ise hiçbir
  // kanalda 1'i aşmaz. Böylece yalnızca Güneş parlar.
  bloom.materialHighPassFilter.fragmentShader = bloom.materialHighPassFilter.fragmentShader.replace(
    'float v = dot( texel.xyz, luma );',
    'float v = max( texel.r, max( texel.g, texel.b ) );'
  );
  bloom.materialHighPassFilter.uniforms.smoothWidth.value = 0.25;
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Denetimler ---------------------------------------------------------
  const kontroller = new OrbitControls(kamera, renderer.domElement);
  kontroller.enableDamping = true;
  kontroller.dampingFactor = 0.07;
  kontroller.rotateSpeed = 0.55;
  kontroller.zoomSpeed = 0.9;
  kontroller.panSpeed = 0.8;
  kontroller.minDistance = 14;
  kontroller.maxDistance = 1500;
  kontroller.autoRotateSpeed = 0.7;
  kontroller.enabled = false; // açılış uçuşu bitene kadar

  // ---- Sahne içeriği ------------------------------------------------------
  const yonetici = new THREE.LoadingManager();
  let yuklemeHatasi = false;
  yonetici.onProgress = (_url, yuklenen, toplam) => {
    const oran = yuklenen / toplam;
    ui.yuklemeIlerleme(oran, `Dokular yükleniyor… %${Math.round(oran * 100)}`);
  };
  yonetici.onError = (url) => {
    yuklemeHatasi = true;
    ui.yuklemeIlerleme(0, `Yüklenemedi: ${url}`);
  };
  yonetici.onLoad = () => {
    if (!yuklemeHatasi) ui.yuklemeIlerleme(1, 'Hazır');
    // İlk kare: shader derleme ve doku yükleme takılması açılış ekranının arkasında kalsın
    kare();
    setTimeout(() => {
      ui.yuklemeBitti();
      saat.getDelta();
      renderer.setAnimationLoop(kare);
      acilis();
    }, 250);
  };

  const sistem = gunesSistemiKur({
    sahne,
    yonetici,
    anizotropi: Math.min(8, renderer.capabilities.getMaxAnisotropy()),
    pikselOrani,
    etiketTiklandi: (id) => odaklan(id),
  });

  // Simülasyon saati. Başlangıç: bugünün J2000'den bu yana gün sayısı; böylece
  // gezegenler yaklaşık olarak bugünkü gerçek konumlarında başlar.
  const baslangicGun = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const zaman = {
    simGun: baslangicGun, // yörünge hareketi
    donusGun: 0, // eksen dönüşleri (hız sınırlı)
    uyduGun: 0, // uydu hareketi (hız sınırlı)
    gorsel: 0, // shader animasyonları (sn)
  };

  const saat = new THREE.Clock();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  const kaydirma = { x: 0, y: 0 }; // panel açıkken görüntü merkezinin kayması (piksel)

  // ---- Kamera uçuşu -------------------------------------------------------

  /**
   * Kamerayı yumuşak, yay çizen bir yolla hedefe uçurur.
   * `hedefAl` her karede güncel hedef konumunu verir (gövde yörüngede ilerlerken
   * varış noktası da onunla birlikte kayar); `ofset` kameranın hedefe göre son konumudur.
   */
  function ucusBaslat({ hedefAl, ofset, sure = UCUS_SURESI, enYakin, yay = true, bitince }) {
    kontroller.enabled = false;
    durum.ucus = {
      t: 0,
      sure,
      p0: kamera.position.clone(),
      h0: kontroller.target.clone(),
      hedefAl,
      ofset,
      enYakin,
      yay,
      bitince,
    };
  }

  function ucusGuncelle(dt, dAci) {
    const u = durum.ucus;
    u.t = Math.min(1, u.t + dt / u.sure);
    if (dAci) u.ofset.applyAxisAngle(Y_EKSENI, dAci);

    const k = yumusak(u.t);
    u.hedefAl(v1); // güncel hedef
    v2.copy(v1).add(u.ofset); // güncel varış noktası

    kamera.position.lerpVectors(u.p0, v2, k);
    if (u.yay) {
      // Yolun ortasında yükselen yay: hem daha sinematik hem Güneş'in içinden geçmez
      kamera.position.y += Math.sin(Math.PI * k) * Math.min(u.p0.distanceTo(v2) * 0.14, 95);
    }
    // Bakış hedefi konumdan biraz önce varır; kamera önce hedefe döner, sonra yaklaşır
    kontroller.target.lerpVectors(u.h0, v1, yumusak(Math.min(1, u.t * 1.4)));
    kamera.lookAt(kontroller.target);

    if (u.t >= 1) {
      durum.ucus = null;
      kontroller.minDistance = u.enYakin;
      kontroller.enabled = true;
      kontroller.update();
      if (u.bitince) u.bitince();
    }
  }

  /** Dikey ekranlarda gövdenin kadraja sığması için uzaklık çarpanı. */
  function dikeyCarpan() {
    const oran = genislik / yukseklik;
    const carpan = oran < 1 ? Math.min(1.9, Math.pow(1 / oran, 0.7)) : 1;
    // Mobilde alttan çıkan çekmece ekranın bir kısmını kapatır; biraz daha uzaktan bak
    return genislik <= 720 ? carpan * 1.45 : carpan;
  }

  function genelOfset() {
    const oran = genislik / yukseklik;
    const uzaklik = Math.min(1300, Math.max(460, 415 / (0.414 * oran)));
    return new THREE.Vector3(0, 0.42, 0.908).multiplyScalar(uzaklik);
  }

  function gunesAcisi(g) {
    (g.ebeveyn || g).dunyaKonumu(v3);
    return Math.atan2(-v3.z, v3.x);
  }

  // ---- Odaklanma ----------------------------------------------------------

  function odaklan(id, { panel = true } = {}) {
    const g = sistem.govdeler.get(id);
    if (!g) return;
    durum.odak = g;
    durum.sonAci = gunesAcisi(g);
    kontroller.enablePan = false;

    ui.sec(id);
    sistem.yorungeVurgula(id);
    if (panel) {
      ui.panelGoster(id);
      durum.panelAcik = true;
    }

    const konum = g.dunyaKonumu(new THREE.Vector3());
    const yon = new THREE.Vector3();
    if (g.tip === 'yildiz') {
      // Güneş'e bulunduğumuz yönden yaklaş
      yon.copy(kamera.position).sub(konum);
      yon.y = 0;
      if (yon.lengthSq() < 1e-6) yon.set(0, 0, 1);
      yon.normalize();
      yon.y = 0.26;
    } else {
      // Güneş'e bakan (aydınlık) taraftan, biraz yandan ve yukarıdan yaklaş:
      // böylece hem gündüz yüzü hem terminatör görünür
      yon.copy(konum).multiplyScalar(-1);
      yon.y = 0;
      yon.normalize().applyAxisAngle(Y_EKSENI, 0.62);
      yon.y = 0.24;
    }
    yon.normalize().multiplyScalar(g.yaricap * g.bakisCarpani * dikeyCarpan());

    ucusBaslat({
      hedefAl: (hedefVektor) => g.dunyaKonumu(hedefVektor),
      ofset: yon,
      enYakin: g.yaricap * 1.35,
    });
  }

  function genelGorunum(sure = UCUS_SURESI) {
    durum.odak = null;
    durum.panelAcik = false;
    kontroller.enablePan = true;
    ui.sec(null);
    ui.panelGizle();
    sistem.yorungeVurgula(null);
    ucusBaslat({
      hedefAl: (hedefVektor) => hedefVektor.set(0, 0, 0),
      ofset: genelOfset(),
      sure,
      enYakin: 14,
    });
  }

  function komsuyaGit(yon) {
    let sira;
    if (!durum.odak) {
      sira = yon > 0 ? 0 : ANA_SIRA.length - 1;
    } else if (durum.odak.ebeveyn) {
      // Uydudan: geri → kendi gezegeni, ileri → sonraki gezegen
      const ebeveynSira = ANA_SIRA.indexOf(durum.odak.ebeveyn.id);
      sira = yon > 0 ? ebeveynSira + 1 : ebeveynSira;
    } else {
      sira = ANA_SIRA.indexOf(durum.odak.id) + yon;
    }
    sira = (sira + ANA_SIRA.length) % ANA_SIRA.length;
    odaklan(ANA_SIRA[sira]);
  }

  // ---- Açılış -------------------------------------------------------------

  function acilis() {
    ucusBaslat({
      hedefAl: (hedefVektor) => hedefVektor.set(0, 0, 0),
      ofset: genelOfset(),
      sure: ACILIS_SURESI,
      enYakin: 14,
      yay: false,
      bitince: () => {
        durum.acilisIpucu = true;
        ui.ipucu('<b>Sürükle:</b> döndür · <b>Tekerlek:</b> yakınlaş · <b>Tıkla:</b> gezegene git', 9000);
      },
    });
  }

  // ---- Tur ----------------------------------------------------------------

  function turAdimi() {
    const id = ANA_SIRA[durum.tur.sira];
    durum.tur.bekleme = 0;
    odaklan(id);
    ui.ipucu(
      `<b>Tur</b> · ${VERI.get(id).ad} · ${durum.tur.sira + 1}/${ANA_SIRA.length} — durdurmak için tıkla ya da bir tuşa bas`,
      0
    );
  }

  function turBaslat() {
    durum.tur = { sira: 0, bekleme: 0 };
    durum.acilisIpucu = false;
    ui.dugmeDurumu('tur', true);
    turAdimi();
  }

  function turDurdur({ genel = false } = {}) {
    if (!durum.tur) return;
    durum.tur = null;
    kontroller.autoRotate = false;
    ui.dugmeDurumu('tur', false);
    ui.ipucuGizle();
    if (genel) genelGorunum();
  }

  function turDegistir() {
    if (durum.tur) turDurdur();
    else turBaslat();
  }

  function turGuncelle(dt) {
    const tur = durum.tur;
    if (!tur) return;
    // Gövdenin başındayken kamera yavaşça çevresinde dolanır
    kontroller.autoRotate = !durum.ucus && !AZ_HAREKET;
    if (durum.ucus) return;
    tur.bekleme += dt;
    if (tur.bekleme >= TUR_BEKLEME) {
      tur.sira += 1;
      if (tur.sira >= ANA_SIRA.length) turDurdur({ genel: true });
      else turAdimi();
    }
  }

  // ---- Aç/kapa ------------------------------------------------------------

  function duraklatDegistir() {
    durum.duraklat = !durum.duraklat;
    ui.duraklatildi(durum.duraklat);
  }

  function yorungeleriDegistir() {
    durum.yorungeler = !durum.yorungeler;
    sistem.yorungeleriGoster(durum.yorungeler);
    ui.dugmeDurumu('yorunge', durum.yorungeler);
  }

  function etiketleriDegistir() {
    durum.etiketler = !durum.etiketler;
    ui.dugmeDurumu('etiket', durum.etiketler);
  }

  // ---- Tıklama ve üzerine gelme -------------------------------------------

  const isinlayici = new THREE.Raycaster();
  const fare = new THREE.Vector2();
  const tuval = renderer.domElement;
  const isaretciler = new Map(); // etkin işaretçiler (çoklu dokunuşu ayırt etmek için)
  let basma = null; // { x, y, zaman, gecerli }
  let uzerindeKontrol = false;
  let sonFare = null;

  /** Ekran koordinatındaki gövdenin kimliğini döndürür (yoksa null). */
  function govdeBul(x, y) {
    const kutu = tuval.getBoundingClientRect();
    fare.set(((x - kutu.left) / kutu.width) * 2 - 1, -((y - kutu.top) / kutu.height) * 2 + 1);
    kamera.updateMatrixWorld();
    isinlayici.setFromCamera(fare, kamera);
    const isabetler = isinlayici.intersectObjects(sistem.isabetListesi(kamera, yukseklik), false);
    return isabetler.length ? isabetler[0].object.userData.id : null;
  }

  tuval.addEventListener('pointerdown', (olay) => {
    isaretciler.set(olay.pointerId, true);
    basma = {
      x: olay.clientX,
      y: olay.clientY,
      zaman: performance.now(),
      // Yalnızca tek parmak / sol tuş tıklama sayılır
      gecerli: isaretciler.size === 1 && olay.button === 0,
    };
    if (isaretciler.size > 1 && basma) basma.gecerli = false;
  });

  tuval.addEventListener('pointermove', (olay) => {
    if (olay.pointerType === 'mouse' && olay.buttons === 0) {
      sonFare = { x: olay.clientX, y: olay.clientY };
      uzerindeKontrol = true;
    }
  });

  tuval.addEventListener('pointerleave', () => {
    sonFare = null;
    tuval.style.cursor = '';
  });

  function isaretciBirak(olay) {
    isaretciler.delete(olay.pointerId);
  }
  window.addEventListener('pointercancel', isaretciBirak);
  window.addEventListener('pointerup', (olay) => {
    const b = basma;
    isaretciBirak(olay);
    if (!b || !b.gecerli || olay.target !== tuval) return;
    basma = null;
    // Sürükleme ile tıklamayı ayır: birkaç pikselden fazla oynadıysa tıklama değildir
    const oynama = Math.hypot(olay.clientX - b.x, olay.clientY - b.y);
    if (oynama > 6 || performance.now() - b.zaman > 700) return;
    const id = govdeBul(olay.clientX, olay.clientY);
    if (id) odaklan(id);
  });

  // ---- Kullanıcı etkileşimi turu durdurur ---------------------------------

  function etkilesim(olay) {
    if (durum.acilisIpucu) {
      durum.acilisIpucu = false;
      ui.ipucuGizle();
    }
    if (durum.tur && !(olay.target instanceof Element && olay.target.closest('#dugme-tur'))) {
      turDurdur();
    }
  }
  window.addEventListener('pointerdown', etkilesim, true);
  window.addEventListener('wheel', etkilesim, { capture: true, passive: true });

  // ---- Klavye -------------------------------------------------------------

  window.addEventListener('keydown', (olay) => {
    if (olay.metaKey || olay.ctrlKey || olay.altKey) return;
    const tus = olay.key;

    if (ui.yardimAcik()) {
      if (tus === 'Escape') ui.yardimGoster(false);
      return;
    }

    const turTusu = tus === 't' || tus === 'T';
    if (durum.tur && !turTusu) turDurdur();
    if (durum.acilisIpucu) {
      durum.acilisIpucu = false;
      ui.ipucuGizle();
    }

    const hedef = olay.target;
    const dugmede = hedef instanceof HTMLElement && (hedef.tagName === 'BUTTON' || hedef.tagName === 'INPUT');

    if (tus >= '0' && tus <= '8' && tus.length === 1) {
      odaklan(ANA_SIRA[Number(tus)]);
    } else if (tus === ' ') {
      // Boşluk her yerde duraklatır; odaktaki düğmeyi ayrıca tetiklemesin (Enter çalışmaya devam eder)
      olay.preventDefault();
      duraklatDegistir();
    } else if (tus === 'Escape') {
      genelGorunum();
    } else if (tus === 'o' || tus === 'O') {
      yorungeleriDegistir();
    } else if (tus === 'l' || tus === 'L') {
      etiketleriDegistir();
    } else if (turTusu) {
      turDegistir();
    } else if (tus === '?') {
      ui.yardimGoster(true);
    } else if (tus === 'ArrowRight' && !(dugmede && hedef.tagName === 'INPUT')) {
      komsuyaGit(1);
    } else if (tus === 'ArrowLeft' && !(dugmede && hedef.tagName === 'INPUT')) {
      komsuyaGit(-1);
    }
  });

  // ---- Pencere olayları ---------------------------------------------------

  window.addEventListener('resize', () => {
    genislik = window.innerWidth;
    yukseklik = window.innerHeight;
    kamera.aspect = genislik / yukseklik;
    kamera.updateProjectionMatrix();
    renderer.setSize(genislik, yukseklik);
    composer.setSize(genislik, yukseklik);
    etiketRenderer.setSize(genislik, yukseklik);
  });

  // Sekme gizlenince animasyonu durdur, dönünce zaman sıçramasın
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else if (calisiyor) {
      saat.getDelta();
      renderer.setAnimationLoop(kare);
    }
  });

  // ---- Kare döngüsü -------------------------------------------------------

  let calisiyor = false;

  function kare() {
    calisiyor = true;
    const dt = Math.min(saat.getDelta(), 0.1);

    // Birikimli simülasyon zamanı: hız değişse de konumlar sıçramaz
    if (!durum.duraklat) {
      zaman.simGun += dt * durum.hiz;
      zaman.donusGun += dt * Math.min(durum.hiz, DONUS_HIZ_SINIRI);
      zaman.uyduGun += dt * Math.min(durum.hiz, UYDU_HIZ_SINIRI);
      zaman.gorsel += dt;
    }
    sistem.guncelle(zaman);

    // Odaktaki gövdenin bu karedeki yer değiştirmesi ve Güneş çevresindeki dönüşü
    let dAci = 0;
    const odak = durum.odak;
    if (odak && odak.tip !== 'yildiz') {
      const aci = gunesAcisi(odak);
      dAci = aciSarmala(aci - durum.sonAci);
      durum.sonAci = aci;
    }

    if (durum.ucus) {
      ucusGuncelle(dt, dAci);
    } else {
      if (odak) {
        // TAKİP: kameranın gövdeye göre konumu korunur; ayrıca gövdeyle birlikte
        // Güneş'in çevresinde döndürülür ki aydınlık taraf kadrajda kalsın.
        // Kullanıcı bu sırada serbestçe dönebilir ve yakınlaşabilir.
        v1.copy(kamera.position).sub(kontroller.target);
        if (dAci) v1.applyAxisAngle(Y_EKSENI, dAci);
        odak.dunyaKonumu(kontroller.target);
        kamera.position.copy(kontroller.target).add(v1);
      }
      kontroller.update();
    }

    turGuncelle(dt);

    // Yakın kırpma düzlemi uzaklığa göre ayarlanır: yakında ayrıntı, uzakta z-fighting'siz derinlik
    const hedefUzaklik = kamera.position.distanceTo(kontroller.target);
    const yuzeyUzaklik = odak ? Math.max(hedefUzaklik - odak.yaricap, 0.02) : hedefUzaklik;
    kamera.near = THREE.MathUtils.clamp(yuzeyUzaklik * 0.05, 0.01, 2);

    // Panel açıkken görüntü merkezini panelin kapatmadığı alana kaydır
    const mobil = genislik <= 720;
    const hedefX = durum.panelAcik && !mobil ? Math.min(184, genislik * 0.14) : 0;
    const hedefY = durum.panelAcik && mobil ? yukseklik * 0.19 : 0;
    const yaklasma = 1 - Math.exp(-dt * 4.5);
    kaydirma.x += (hedefX - kaydirma.x) * yaklasma;
    kaydirma.y += (hedefY - kaydirma.y) * yaklasma;
    kamera.setViewOffset(genislik, yukseklik, kaydirma.x, kaydirma.y, genislik, yukseklik);
    kamera.updateMatrixWorld();

    sistem.kameraIzle(kamera, dt);
    sistem.etiketleriGuncelle(kamera, odak, durum.etiketler, genislik, yukseklik);
    ui.gecenSure(zaman.simGun - baslangicGun);

    // İmleç: bir gövdenin üzerindeyken işaret parmağı
    if (uzerindeKontrol && sonFare) {
      uzerindeKontrol = false;
      tuval.style.cursor = govdeBul(sonFare.x, sonFare.y) ? 'pointer' : '';
    }

    composer.render(dt);
    etiketRenderer.render(sahne, kamera);
  }
}
