// ---------------------------------------------------------------------------
// Arayüz: açılış ekranı, gezegen menüsü, bilgi paneli, zaman denetimi, yardım
// Bu modül yalnızca DOM ile ilgilenir; sahneyle bağlantıyı `olaylar` kurar.
// ---------------------------------------------------------------------------
import { GOVDELER, VERI } from './data.js';

const $ = (id) => document.getElementById(id);

// Hız kaydırıcısı logaritmiktir: 1 saat/sn ile 2 yıl/sn arası (gün/sn cinsinden)
const HIZ_EN_AZ = 1 / 24;
const HIZ_EN_COK = 730.5;
const KAYDIRICI_EN_COK = 1000;

export function kaydiricidanHiza(deger) {
  return HIZ_EN_AZ * Math.pow(HIZ_EN_COK / HIZ_EN_AZ, deger / KAYDIRICI_EN_COK);
}

function sayi(n, basamak = 0) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: basamak, maximumFractionDigits: basamak });
}

function hizYazisi(gunSn) {
  if (gunSn < 0.96) return `${sayi(Math.max(1, Math.round(gunSn * 24)))} saat/sn`;
  if (gunSn < 10) return `${sayi(gunSn, 1)} gün/sn`;
  if (gunSn < 365) return `${sayi(Math.round(gunSn))} gün/sn`;
  return `${sayi(gunSn / 365.25, 1)} yıl/sn`;
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
    yardimDugme: $('dugme-yardim'),
    yardim: $('yardim'),
    yardimKapat: $('yardim-kapat'),
  };

  // ---- Gezegen menüsü -----------------------------------------------------
  const menuOgeleri = new Map();
  for (const g of GOVDELER) {
    const dugme = document.createElement('button');
    dugme.type = 'button';
    dugme.className = 'menu-oge';
    dugme.dataset.id = g.id;
    dugme.setAttribute('aria-label', g.ad);

    const kure = document.createElement('span');
    kure.className = 'kure';
    kure.style.setProperty('--c1', g.renkler[0]);
    kure.style.setProperty('--c2', g.renkler[1]);

    const ad = document.createElement('span');
    ad.className = 'ad';
    ad.textContent = g.ad;

    dugme.append(kure, ad);
    dugme.addEventListener('click', () => olaylar.sec(g.id));
    el.menu.appendChild(dugme);
    menuOgeleri.set(g.id, dugme);
  }

  // ---- Bilgi paneli -------------------------------------------------------
  let panelZamanlayici = 0;

  function paneliDoldur(v) {
    el.panelTur.textContent = v.tur;
    el.panelAd.textContent = v.ad;
    el.panelAciklama.textContent = v.aciklama;

    el.panelVeriler.replaceChildren(
      ...v.veriler.map(([anahtar, deger]) => {
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
      cip.append(nokta, hedef.ad);
      cip.addEventListener('click', () => olaylar.sec(hedef.id));
      cipler.push(cip);
    };
    if (v.uydular && v.uydular.length) {
      const baslik = document.createElement('span');
      baslik.textContent = v.uydular.length > 1 ? 'Büyük uydular' : 'Uydusu';
      cipler.push(baslik);
      v.uydular.forEach(cipEkle);
    } else if (v.ebeveynId) {
      const baslik = document.createElement('span');
      baslik.textContent = 'Gezegeni';
      cipler.push(baslik);
      cipEkle(VERI.get(v.ebeveynId));
    }
    el.panelUydular.replaceChildren(...cipler);

    el.panelBilgiler.replaceChildren(
      ...v.bilgiler.map((metin) => {
        const li = document.createElement('li');
        li.textContent = metin;
        return li;
      })
    );
    el.panelGovde.scrollTop = 0;
  }

  $('panel-onceki').addEventListener('click', () => olaylar.onceki());
  $('panel-sonraki').addEventListener('click', () => olaylar.sonraki());
  $('panel-kapat').addEventListener('click', () => olaylar.panelKapat());

  // ---- Zaman denetimi -----------------------------------------------------
  function kaydiriciGuncelle() {
    const deger = Number(el.kaydirici.value);
    el.kaydirici.style.setProperty('--oran', `${(deger / KAYDIRICI_EN_COK) * 100}%`);
    const hiz = kaydiricidanHiza(deger);
    el.hizEtiket.textContent = hizYazisi(hiz);
    return hiz;
  }
  el.kaydirici.addEventListener('input', () => olaylar.hiz(kaydiriciGuncelle()));
  el.oynat.addEventListener('click', () => olaylar.duraklat());

  // ---- Üst düğmeler -------------------------------------------------------
  el.tur.addEventListener('click', () => olaylar.tur());
  el.yorunge.addEventListener('click', () => olaylar.yorungeler());
  el.etiket.addEventListener('click', () => olaylar.etiketler());
  el.genel.addEventListener('click', () => olaylar.genelGorunum());
  el.tamEkran.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  if (!document.fullscreenEnabled) el.tamEkran.hidden = true;

  // ---- Yardım penceresi ---------------------------------------------------
  function yardimAcik() {
    return !el.yardim.hidden;
  }
  function yardimGoster(acik) {
    el.yardim.hidden = !acik;
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

  let sonGecenSure = '';

  return {
    /** Kaydırıcının başlangıç değerinden hızı okur. */
    baslangicHizi: kaydiriciGuncelle,

    yuklemeIlerleme(oran, metin) {
      el.ilerleme.style.transform = `scaleX(${Math.min(1, Math.max(0, oran))})`;
      if (metin) el.yuklemeDurum.textContent = metin;
    },

    yuklemeBitti() {
      el.yukleme.classList.add('bitti');
    },

    /** Menüde seçili öğeyi işaretler; uydu seçiliyse gezegeni vurgulanır. */
    sec(id) {
      const v = id ? VERI.get(id) : null;
      const anaId = v ? v.ebeveynId || v.id : null;
      for (const [oid, dugme] of menuOgeleri) {
        const secili = oid === anaId;
        dugme.classList.toggle('secili', secili);
        if (secili) dugme.setAttribute('aria-current', 'true');
        else dugme.removeAttribute('aria-current');
        if (secili) {
          // Mobilde seçili öğe görünür alana kaysın (sayfayı kaydırmadan)
          const hedef = dugme.offsetLeft - (el.menu.clientWidth - dugme.offsetWidth) / 2;
          el.menu.scrollTo({ left: hedef, behavior: 'smooth' });
        }
      }
    },

    panelGoster(id) {
      const v = VERI.get(id);
      if (!v) return;
      clearTimeout(panelZamanlayici);
      if (el.panel.classList.contains('acik')) {
        // Açık panelde içerik kısa bir geçişle değişir
        el.panelGovde.classList.add('degisiyor');
        panelZamanlayici = setTimeout(() => {
          paneliDoldur(v);
          el.panelGovde.classList.remove('degisiyor');
        }, 200);
      } else {
        paneliDoldur(v);
        el.panelGovde.classList.remove('degisiyor');
        el.panel.classList.add('acik');
        el.panel.setAttribute('aria-hidden', 'false');
      }
    },

    panelGizle() {
      el.panel.classList.remove('acik');
      el.panel.setAttribute('aria-hidden', 'true');
    },

    duraklatildi(durdu) {
      el.zaman.classList.toggle('duraklatildi', durdu);
      el.oynat.setAttribute('aria-label', durdu ? 'Oynat' : 'Duraklat');
    },

    gecenSure(gun) {
      const yil = Math.floor(gun / 365.25);
      const kalan = Math.floor(gun - yil * 365.25);
      const metin = yil > 0 ? `${sayi(yil)} yıl ${kalan} gün` : `${kalan} gün`;
      if (metin !== sonGecenSure) {
        sonGecenSure = metin;
        el.gecenSure.textContent = metin;
      }
    },

    dugmeDurumu(ad, acik) {
      const dugme = { tur: el.tur, yorunge: el.yorunge, etiket: el.etiket }[ad];
      if (dugme) dugme.setAttribute('aria-pressed', String(acik));
    },

    /** Üstte kısa bir ipucu gösterir. `sure` 0 ise elle gizlenene kadar kalır. */
    ipucu(html, sure = 6000) {
      clearTimeout(ipucuZamanlayici);
      el.ipucu.innerHTML = html;
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

    hataGoster(baslik, metin) {
      el.yukleme.style.display = 'none';
      $('hata-baslik').textContent = baslik;
      $('hata-metin').textContent = metin;
      $('hata').hidden = false;
    },
  };
}
