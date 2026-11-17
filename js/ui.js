// ---------------------------------------------------------------------------
// Arayüz: açılış ekranı, gezegen menüsü, bilgi paneli, zaman denetimi, yardım
// Bu modül yalnızca DOM ile ilgilenir; sahneyle bağlantıyı `olaylar` kurar.
// Bütün metinler i18n.js üzerinden gelir; dil değişince burada yeniden yazılır.
// ---------------------------------------------------------------------------
import { GOVDELER, VERI } from './data.js';
import {
  t,
  govdeMetni,
  sayiBicimle,
  etkinDil,
  dilAyarla,
  dilDegisince,
  domCevir,
} from './i18n.js';

const $ = (id) => document.getElementById(id);
const AZ_HAREKET = window.matchMedia('(prefers-reduced-motion: reduce)');

// Hız kaydırıcısı logaritmiktir: 1 saat/sn ile 2 yıl/sn arası (gün/sn cinsinden)
const HIZ_EN_AZ = 1 / 24;
const HIZ_EN_COK = 730.5;
const KAYDIRICI_EN_COK = 1000;

export function kaydiricidanHiza(deger) {
  return HIZ_EN_AZ * Math.pow(HIZ_EN_COK / HIZ_EN_AZ, deger / KAYDIRICI_EN_COK);
}

function hizdanKaydiriciya(gunSn) {
  const oran = Math.log(gunSn / HIZ_EN_AZ) / Math.log(HIZ_EN_COK / HIZ_EN_AZ);
  return Math.round(Math.min(1, Math.max(0, oran)) * KAYDIRICI_EN_COK);
}

/** Bilgi paneli mobilde alttan çıkan çekmecedir (bkz. style.css, max-width: 720px). */
const MOBIL = window.matchMedia('(max-width: 720px)');

function hizYazisi(gunSn) {
  if (gunSn < 0.96) return t('hiz.saat', { n: sayiBicimle(Math.max(1, Math.round(gunSn * 24))) });
  if (gunSn < 10) return t('hiz.gun', { n: sayiBicimle(gunSn, 1) });
  if (gunSn < 365) return t('hiz.gun', { n: sayiBicimle(Math.round(gunSn)) });
  return t('hiz.yil', { n: sayiBicimle(gunSn / 365.25, 1) });
}

/** Belirtilen öğe dışındaki bütün sayfa katmanlarını etkisiz (inert) yapar ya da geri açar. */
function arkaPlaniKilitle(haric, kilitli) {
  for (const cocuk of document.body.children) {
    if (cocuk === haric || cocuk.tagName === 'SCRIPT') continue;
    cocuk.inert = kilitli;
  }
}

/**
 * Hata ekranını gösterir (arayüz kurulmadan da çağrılabilir). Metinler anahtar
 * olarak verilir; böylece etkin dilde yazılır. Arkadaki arayüz etkisiz kalır.
 */
export function hataGoster(baslikAnahtar, metinAnahtar) {
  const yukleme = $('yukleme');
  if (yukleme) yukleme.style.display = 'none';
  const hata = $('hata');
  $('hata-baslik').dataset.i18n = baslikAnahtar;
  $('hata-metin').dataset.i18n = metinAnahtar;
  domCevir(hata);
  hata.hidden = false;
  arkaPlaniKilitle(hata, true);
}

export function arayuzKur(olaylar) {
  const el = {
    yukleme: $('yukleme'),
    ilerleme: $('ilerleme-dolgu'),
    yuklemeDurum: $('yukleme-durum'),
    menu: $('menu'),
    panel: $('panel'),
    panelGovde: $('panel-govde'),
    panelTur: $('panel-tur'),
    panelAd: $('panel-ad'),
    panelAciklama: $('panel-aciklama'),
    panelVeriler: $('panel-veriler'),
    panelUydular: $('panel-uydular'),
    panelBilgiler: $('panel-bilgiler'),
    panelEylem: $('panel-eylem'),
    panelTutamac: $('panel-tutamac'),
    ust: document.querySelector('.ust'),
    ipucu: $('ipucu'),
    oynat: $('dugme-oynat'),
    zaman: document.querySelector('.zaman'),
    kaydirici: $('hiz-kaydirici'),
    hizEtiket: $('hiz-etiket'),
    gecenSure: $('gecen-sure'),
    tur: $('dugme-tur'),
    yorunge: $('dugme-yorunge'),
    etiket: $('dugme-etiket'),
    genel: $('dugme-genel'),
    tamEkran: $('dugme-tamekran'),
    dil: $('dugme-dil'),
    yardimDugme: $('dugme-yardim'),
    yardim: $('yardim'),
    yardimKapat: $('yardim-kapat'),
  };

  // ---- Gezegen menüsü -----------------------------------------------------
  const menuOgeleri = new Map(); // id → { dugme, ad }
  for (const g of GOVDELER) {
    const dugme = document.createElement('button');
    dugme.type = 'button';
    dugme.className = 'menu-oge';
    dugme.dataset.id = g.id;

    const kure = document.createElement('span');
    kure.className = 'kure';
    kure.style.setProperty('--c1', g.renkler[0]);
    kure.style.setProperty('--c2', g.renkler[1]);

    const ad = document.createElement('span');
    ad.className = 'ad';

    dugme.append(kure, ad);
    dugme.addEventListener('click', () => olaylar.sec(g.id));
    el.menu.appendChild(dugme);
    menuOgeleri.set(g.id, { dugme, ad });
  }

  function menuYaz() {
    for (const [id, { dugme, ad }] of menuOgeleri) {
      const metin = govdeMetni(id).ad;
      ad.textContent = metin;
      dugme.setAttribute('aria-label', metin);
    }
  }
  menuYaz();
  // Açılışta ölç (üst çubuk yüksekliği ekran genişliğine göre değişir)
  requestAnimationFrame(() => serbestAlanOlc());

  // ---- Bilgi paneli -------------------------------------------------------
  let panelZamanlayici = 0;
  let panelId = null; // panelde gösterilen gövde
  let canliMetin = null; // kuyruklu yıldızın canlı uzaklık satırı
  let enberiDugme = null; // kuyruk zaten görünürken gizlenir
  let sonCanli = null;

  function paneliDoldur(id, { kaydirmayiKoru = false } = {}) {
    const v = VERI.get(id);
    const m = govdeMetni(id);
    panelId = id;
    el.panelTur.textContent = m.tur;
    el.panelAd.textContent = m.ad;
    el.panelAciklama.textContent = m.aciklama;

    // Kuyruklu yıldız: canlı uzaklık ve bir sonraki enberiye atlama düğmesi
    canliMetin = null;
    enberiDugme = null;
    sonCanli = null;
    if (v.tip === 'kuyruklu') {
      const dugme = document.createElement('button');
      dugme.type = 'button';
      dugme.className = 'panel-eylem-dugme';
      dugme.textContent = t('panel.enberiyeGit');
      dugme.addEventListener('click', () => olaylar.enberiyeGit(id));
      canliMetin = document.createElement('span');
      canliMetin.className = 'panel-canli';
      enberiDugme = dugme;
      el.panelEylem.replaceChildren(canliMetin, dugme);
    } else {
      el.panelEylem.replaceChildren();
    }

    el.panelVeriler.replaceChildren(
      ...m.veriler.map(([anahtar, deger]) => {
        const kutu = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = anahtar;
        const dd = document.createElement('dd');
        dd.textContent = deger;
        kutu.append(dt, dd);
        return kutu;
      })
    );

    // Gezegende uydu çipleri, uyduda gezegenine dönüş çipi
    const cipler = [];
    const cipEkle = (hedef) => {
      const cip = document.createElement('button');
      cip.type = 'button';
      cip.className = 'uydu-cip';
      const nokta = document.createElement('i');
      nokta.style.setProperty('--c1', hedef.renkler[0]);
      nokta.style.setProperty('--c2', hedef.renkler[1]);
      cip.append(nokta, govdeMetni(hedef.id).ad);
      cip.addEventListener('click', () => olaylar.sec(hedef.id));
      cipler.push(cip);
    };
    if (v.uydular && v.uydular.length) {
      const baslik = document.createElement('span');
      baslik.textContent = t(v.uydular.length > 1 ? 'panel.buyukUydular' : 'panel.uydusu');
      cipler.push(baslik);
      v.uydular.forEach(cipEkle);
    } else if (v.ebeveynId) {
      const baslik = document.createElement('span');
      baslik.textContent = t(v.ebeveynId === 'pluton' ? 'panel.cuceGezegeni' : 'panel.gezegeni');
      cipler.push(baslik);
      cipEkle(VERI.get(v.ebeveynId));
    }
    el.panelUydular.replaceChildren(...cipler);

    el.panelBilgiler.replaceChildren(
      ...m.bilgiler.map((metin) => {
        const li = document.createElement('li');
        li.textContent = metin;
        return li;
      })
    );
    if (!kaydirmayiKoru) el.panelGovde.scrollTop = 0;
  }

  // ---- Mobil çekmece --------------------------------------------------------
  // Panel önce küçük açılır (ad + kısa açıklama), gövde görünür kalır. Yukarı
  // kaydırınca ya da tutamağa/metne dokununca genişler; aşağı kaydırınca önce
  // küçülür, sonra kapanır.
  let serbest = { ust: 0, alt: window.innerHeight }; // gövdenin görünebildiği dikey alan

  function serbestAlanOlc() {
    const ustAlt = el.ust.getBoundingClientRect().bottom;
    // Geniş çekmece üst çubuğun hemen altında durur (style.css: --ust-alt)
    document.documentElement.style.setProperty('--ust-alt', `${Math.round(ustAlt)}px`);
    let alt = window.innerHeight;
    if (MOBIL.matches && el.panel.classList.contains('acik')) {
      // Geniş çekmece okumak içindir: kadraj her zaman küçük çekmeceye göre kurulur
      const stil = getComputedStyle(el.panel);
      const kucuk = parseFloat(stil.getPropertyValue('--cekmece-kucuk')) || 200;
      alt = window.innerHeight - parseFloat(stil.bottom) - kucuk;
    }
    serbest = { ust: ustAlt, alt };
  }

  function cekmeceGenislet(genis) {
    if (!MOBIL.matches) return;
    el.panel.classList.toggle('genis', genis);
    el.panelTutamac.setAttribute('aria-expanded', String(genis));
    el.panelTutamac.setAttribute('aria-label', t(genis ? 'panel.daralt' : 'panel.genislet'));
    if (!genis) el.panelGovde.scrollTop = 0;
  }

  let surukle = null; // { y, zaman }
  function surukleBasla(olay) {
    if (!MOBIL.matches || olay.button !== 0) return;
    if (olay.target instanceof Element && olay.target.closest('.panel-dugmeler')) return;
    surukle = { y: olay.clientY, zaman: performance.now() };
  }
  function surukleBitir(olay) {
    if (!surukle) return;
    const dy = olay.clientY - surukle.y;
    const kisa = performance.now() - surukle.zaman < 600;
    surukle = null;
    const genis = el.panel.classList.contains('genis');
    if (dy < -28) cekmeceGenislet(true);
    else if (dy > 28) {
      if (genis) cekmeceGenislet(false);
      else olaylar.panelKapat();
    } else if (kisa && Math.abs(dy) < 8 && olay.target === el.panelTutamac) {
      cekmeceGenislet(!genis);
    }
  }
  for (const hedef of [el.panelTutamac, el.panel.querySelector('.panel-ust')]) {
    hedef.addEventListener('pointerdown', surukleBasla);
  }
  window.addEventListener('pointerup', surukleBitir);
  window.addEventListener('pointercancel', () => {
    surukle = null;
  });
  el.panelTutamac.addEventListener('keydown', (olay) => {
    if (olay.key === 'Enter' || olay.key === ' ') {
      olay.preventDefault();
      olay.stopPropagation();
      cekmeceGenislet(!el.panel.classList.contains('genis'));
    }
  });
  // Küçük çekmecede metne dokunmak da genişletir (geniş çekmecede metin kayar)
  el.panelGovde.addEventListener('click', (olay) => {
    if (!MOBIL.matches || el.panel.classList.contains('genis')) return;
    if (olay.target instanceof Element && olay.target.closest('button')) return;
    cekmeceGenislet(true);
  });
  // Geniş çekmecede içerik en üstteyken aşağı kaydırma çekmeceyi küçültür
  let govdeDokunus = null;
  el.panelGovde.addEventListener('touchstart', (olay) => {
    govdeDokunus = el.panelGovde.scrollTop <= 0 ? olay.touches[0].clientY : null;
  }, { passive: true });
  el.panelGovde.addEventListener('touchend', (olay) => {
    if (govdeDokunus === null || !el.panel.classList.contains('genis')) return;
    const dy = olay.changedTouches[0].clientY - govdeDokunus;
    govdeDokunus = null;
    if (dy > 60 && el.panelGovde.scrollTop <= 0) cekmeceGenislet(false);
  }, { passive: true });

  const yerlesimDegisti = () => {
    if (!MOBIL.matches) el.panel.classList.remove('genis');
    serbestAlanOlc();
  };
  window.addEventListener('resize', yerlesimDegisti);
  MOBIL.addEventListener('change', yerlesimDegisti);

  $('panel-onceki').addEventListener('click', () => olaylar.onceki());
  $('panel-sonraki').addEventListener('click', () => olaylar.sonraki());
  $('panel-kapat').addEventListener('click', () => olaylar.panelKapat());

  // ---- Zaman denetimi -----------------------------------------------------
  let duraklatildiMi = false;

  function kaydiriciGuncelle() {
    const deger = Number(el.kaydirici.value);
    el.kaydirici.style.setProperty('--oran', `${(deger / KAYDIRICI_EN_COK) * 100}%`);
    const hiz = kaydiricidanHiza(deger);
    const yazi = hizYazisi(hiz);
    el.hizEtiket.textContent = yazi;
    el.kaydirici.setAttribute('aria-valuetext', yazi);
    return hiz;
  }
  el.kaydirici.addEventListener('input', () => olaylar.hiz(kaydiriciGuncelle()));
  el.oynat.addEventListener('click', () => olaylar.duraklat());

  function oynatEtiketiYaz() {
    el.oynat.setAttribute('aria-label', t(duraklatildiMi ? 'oynat.oynat' : 'oynat.duraklat'));
  }
  oynatEtiketiYaz();

  // Geçen süre: yalnızca görünen yıl/gün değişince DOM'a yazılır
  let sonGun = 0;
  let sonSureAnahtari = null;

  function gecenSureYaz(gun) {
    sonGun = gun;
    const yil = Math.floor(gun / 365.25);
    const kalan = Math.floor(gun - yil * 365.25);
    const anahtar = yil * 400 + kalan;
    if (anahtar === sonSureAnahtari) return;
    sonSureAnahtari = anahtar;
    el.gecenSure.textContent =
      yil > 0
        ? t('sure.yilGun', { yil: sayiBicimle(yil), gun: kalan })
        : t('sure.gun', { gun: kalan });
  }

  // ---- Üst düğmeler -------------------------------------------------------
  let turAcik = false;

  function turBasligiYaz() {
    el.tur.title = t(turAcik ? 'tur.durdurBaslik' : 'tur.baslatBaslik');
  }
  turBasligiYaz();

  el.tur.addEventListener('click', () => olaylar.tur());
  el.yorunge.addEventListener('click', () => olaylar.yorungeler());
  el.etiket.addEventListener('click', () => olaylar.etiketler());
  el.genel.addEventListener('click', () => olaylar.genelGorunum());
  el.tamEkran.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  if (!document.fullscreenEnabled) el.tamEkran.hidden = true;

  // Dil düğmesi: TR ↔ EN (sahne durumuna dokunmaz)
  el.dil.addEventListener('click', () => dilAyarla(etkinDil() === 'tr' ? 'en' : 'tr'));

  // ---- Yardım penceresi ---------------------------------------------------
  function yardimAcik() {
    return !el.yardim.hidden;
  }
  function yardimGoster(acik) {
    el.yardim.hidden = !acik;
    // Pencere açıkken arka plan klavye ve ekran okuyucu için erişilemez olsun
    arkaPlaniKilitle(el.yardim, acik);
    if (acik) el.yardimKapat.focus();
    else el.yardimDugme.focus();
  }
  el.yardimDugme.addEventListener('click', () => yardimGoster(true));
  el.yardimKapat.addEventListener('click', () => yardimGoster(false));
  el.yardim.addEventListener('click', (olay) => {
    if (olay.target === el.yardim) yardimGoster(false);
  });

  // ---- İpucu --------------------------------------------------------------
  let ipucuZamanlayici = 0;
  let ipucuUretec = null; // dil değişince ipucunu yeniden üretir

  // ---- Dil değişimi -------------------------------------------------------
  // Statik metinler i18n.js tarafından çevrilir; burada yalnızca kodla yazılanlar yenilenir.
  dilDegisince(() => {
    menuYaz();
    if (panelId && el.panel.classList.contains('acik')) paneliDoldur(panelId, { kaydirmayiKoru: true });
    cekmeceGenislet(el.panel.classList.contains('genis'));
    kaydiriciGuncelle();
    oynatEtiketiYaz();
    turBasligiYaz();
    sonSureAnahtari = null;
    gecenSureYaz(sonGun);
    sonCanli = null;
    if (ipucuUretec && el.ipucu.classList.contains('gorunur')) el.ipucu.innerHTML = ipucuUretec();
  });

  return {
    /** Kaydırıcının başlangıç değerinden hızı okur. */
    baslangicHizi: kaydiriciGuncelle,

    /** `anahtar` bir arayüz dizgisi anahtarıdır; `degiskenler` kalıbı doldurur. */
    yuklemeIlerleme(oran, anahtar, degiskenler) {
      el.ilerleme.style.transform = `scaleX(${Math.min(1, Math.max(0, oran))})`;
      if (anahtar) {
        delete el.yuklemeDurum.dataset.i18n;
        el.yuklemeDurum.textContent = t(anahtar, degiskenler);
      }
    },

    yuklemeBitti() {
      el.yukleme.classList.add('bitti');
    },

    /** Menüde seçili öğeyi işaretler; uydu seçiliyse gezegeni vurgulanır. */
    sec(id) {
      const v = id ? VERI.get(id) : null;
      const anaId = v ? v.ebeveynId || v.id : null;
      for (const [oid, { dugme }] of menuOgeleri) {
        const secili = oid === anaId;
        dugme.classList.toggle('secili', secili);
        if (secili) dugme.setAttribute('aria-current', 'true');
        else dugme.removeAttribute('aria-current');
        if (secili) {
          // Mobilde seçili öğe görünür alana kaysın (sayfayı kaydırmadan)
          const hedef = dugme.offsetLeft - (el.menu.clientWidth - dugme.offsetWidth) / 2;
          el.menu.scrollTo({ left: hedef, behavior: AZ_HAREKET.matches ? 'auto' : 'smooth' });
        }
      }
    },

    panelGoster(id) {
      if (!VERI.get(id)) return;
      clearTimeout(panelZamanlayici);
      if (el.panel.classList.contains('acik')) {
        // Açık panelde içerik kısa bir geçişle değişir
        el.panelGovde.classList.add('degisiyor');
        panelZamanlayici = setTimeout(() => {
          paneliDoldur(id);
          el.panelGovde.classList.remove('degisiyor');
        }, 200);
      } else {
        paneliDoldur(id);
        el.panelGovde.classList.remove('degisiyor');
        cekmeceGenislet(false);
        el.panel.classList.add('acik');
        el.panel.setAttribute('aria-hidden', 'false');
        serbestAlanOlc();
      }
    },

    panelGizle() {
      el.panel.classList.remove('acik', 'genis');
      el.panel.setAttribute('aria-hidden', 'true');
      serbestAlanOlc();
    },

    /** Gövdenin panellerin kapatmadığı dikey alanı: { ust, alt } (piksel). */
    serbestAlan: () => serbest,

    /** Paneldeki kuyruklu yıldızın Güneş'e canlı uzaklığı (AB); yalnızca değişince yazılır. */
    canliUzaklik(id, rAB, etkinlik) {
      if (!canliMetin || id !== panelId) return;
      const anahtar = `${rAB.toFixed(rAB < 10 ? 2 : 1)}|${etkinlik > 0.02}`;
      if (anahtar === sonCanli) return;
      sonCanli = anahtar;
      enberiDugme.hidden = etkinlik > 0.02;
      canliMetin.textContent = t(etkinlik > 0.02 ? 'panel.canliKuyruklu' : 'panel.canli', {
        ab: sayiBicimle(rAB, rAB < 10 ? 2 : 1),
      });
    },

    /** Hız kaydırıcısını verilen değere (gün/sn) getirir; uygulanan hızı döndürür. */
    hizAyarla(gunSn) {
      el.kaydirici.value = String(hizdanKaydiriciya(gunSn));
      return kaydiriciGuncelle();
    },

    duraklatildi(durdu) {
      duraklatildiMi = durdu;
      el.zaman.classList.toggle('duraklatildi', durdu);
      oynatEtiketiYaz();
    },

    gecenSure: gecenSureYaz,

    dugmeDurumu(ad, acik) {
      const dugme = { tur: el.tur, yorunge: el.yorunge, etiket: el.etiket }[ad];
      if (dugme) dugme.setAttribute('aria-pressed', String(acik));
      if (ad === 'tur') {
        turAcik = acik;
        turBasligiYaz();
      }
    },

    /**
     * Üstte kısa bir ipucu gösterir. `uretec` HTML döndüren bir işlevdir; dil
     * değişince yeniden çağrılır. `sure` 0 ise elle gizlenene kadar kalır.
     */
    ipucu(uretec, sure = 6000) {
      clearTimeout(ipucuZamanlayici);
      ipucuUretec = uretec;
      el.ipucu.innerHTML = uretec();
      el.ipucu.classList.add('gorunur');
      if (sure > 0) {
        ipucuZamanlayici = setTimeout(() => el.ipucu.classList.remove('gorunur'), sure);
      }
    },

    ipucuGizle() {
      clearTimeout(ipucuZamanlayici);
      el.ipucu.classList.remove('gorunur');
    },

    yardimAcik,
    yardimGoster,
  };
}
