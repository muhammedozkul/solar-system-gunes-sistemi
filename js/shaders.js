// ---------------------------------------------------------------------------
// Özel shader'lar ve malzeme üreticileri
//
// Bütün aydınlatma hesapları dünya uzayında yapılır. Güneş sahnenin tam
// merkezinde (0,0,0) durduğu için ışık yönü her zaman normalize(-konum) olur;
// ayrıca bir ışık uniform'una gerek kalmaz.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

// ---- Ortak GLSL parçaları -------------------------------------------------

/** Dünya uzayında konum ve normal aktaran genel vertex shader. */
const ORTAK_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vDunyaKonum;
  varying vec3 vDunyaNormal;
  varying vec3 vYerelKonum;
  varying vec3 vEksen;

  void main() {
    vUv = uv;
    vYerelKonum = position;
    // Modelin yerel Y ekseninin (dönme ekseni) dünya uzayındaki yönü
    vEksen = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
    vec4 dk = modelMatrix * vec4(position, 1.0);
    vDunyaKonum = dk.xyz;
    vDunyaNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * dk;
  }
`;

/** 3B simplex gürültüsü (Ian McEwan / Ashima Arts, MIT lisansı). */
const GURULTU = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float toplam = 0.0;
    float genlik = 0.5;
    for (int i = 0; i < 4; i++) {
      toplam += genlik * snoise(p);
      p = p * 2.03 + vec3(11.7, 3.1, 7.3);
      genlik *= 0.5;
    }
    return toplam;
  }
`;

/** Çıkış: tone mapping ve renk uzayı dönüşümü (composer içinde etkisizdir, doğrudan çizimde gerekir). */
const CIKIS = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

// ---- Güneş ----------------------------------------------------------------

/** Kaynayan Güneş yüzeyi: doku + alan bükmeli gürültü + granülasyon + kenar kararması. */
export function gunesMalzemesi(doku) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDoku: { value: doku },
      uZaman: { value: 0 },
    },
    vertexShader: ORTAK_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDoku;
      uniform float uZaman;
      varying vec2 vUv;
      varying vec3 vDunyaKonum;
      varying vec3 vDunyaNormal;
      varying vec3 vYerelKonum;
      ${GURULTU}

      void main() {
        vec3 p = normalize(vYerelKonum);
        float t = uZaman;

        // Büyük ölçekli akış ve onu büken ikinci katman
        float n1 = fbm(p * 2.6 + vec3(0.0, t * 0.045, t * 0.03));
        float n2 = fbm(p * 6.5 - vec3(t * 0.07, 0.0, t * 0.05) + n1 * 0.8);
        // İnce taneli, hızlı kaynayan granülasyon
        float gran = snoise(p * 34.0 + vec3(t * 0.28, -t * 0.21, t * 0.17));

        vec2 uv = vUv + vec2(n1, n2) * 0.01;
        vec3 doku = texture2D(uDoku, uv).rgb;
        float parlaklik = dot(doku, vec3(0.299, 0.587, 0.114));

        float isi = parlaklik * 1.15 + n2 * 0.42 + n1 * 0.22 + gran * 0.07;

        // Renkler ACES tone mapping'e göre seçildi: kırmızı kanal 1'in üstünde
        // (bloom üretir), yeşil düşük tutulur ki sonuç beyaza yıkanmasın.
        vec3 koyu = vec3(0.5, 0.06, 0.004);
        vec3 orta = vec3(1.3, 0.3, 0.03);
        vec3 sicak = vec3(1.8, 0.72, 0.18);
        vec3 renk = mix(koyu, orta, smoothstep(0.05, 0.55, isi));
        renk = mix(renk, sicak, smoothstep(0.55, 1.15, isi));
        renk *= 0.8 + 0.4 * parlaklik;

        // Kenar kararması ve ince kromosfer parıltısı
        vec3 V = normalize(cameraPosition - vDunyaKonum);
        float nv = max(dot(normalize(vDunyaNormal), V), 0.0);
        float kenar = mix(0.5, 1.0, pow(nv, 0.6));
        renk *= kenar;
        renk += vec3(1.0, 0.25, 0.03) * pow(1.0 - nv, 3.0) * 0.5;

        gl_FragColor = vec4(renk, 1.0);
        ${CIKIS}
      }
    `,
  });
}

/** Güneş'in çevresindeki korona: kameraya dönük düzlem üzerinde radyal, hafifçe dalgalanan parıltı. */
export function koronaMalzemesi(icOran) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uZaman: { value: 0 },
      uIc: { value: icOran }, // Güneş yarıçapının düzlem yarı genişliğine oranı
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uZaman;
      uniform float uIc;
      varying vec2 vUv;
      ${GURULTU}

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        vec2 yon = p / max(r, 1e-4);

        // 0: Güneş yüzeyi, 1: düzlemin kenarı
        float x = clamp((r - uIc) / (1.0 - uIc), 0.0, 1.0);

        float isin = 0.78
          + 0.22 * snoise(vec3(yon * 2.2, uZaman * 0.035 + r * 1.2))
          + 0.12 * snoise(vec3(yon * 5.5, uZaman * 0.06 + 4.0));

        float hale = pow(1.0 - x, 3.4);
        float yakin = exp(-x * 9.0);

        vec3 renk = vec3(1.0, 0.42, 0.1) * hale * isin * 0.42
                  + vec3(1.0, 0.5, 0.14) * yakin * 0.55;
        renk *= smoothstep(1.0, 0.72, r);

        // Koyu geçişlerde bantlanmayı kıran çok hafif gürültü
        float kum = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        renk += (kum - 0.5) * 0.004;

        gl_FragColor = vec4(max(renk, 0.0), 1.0);
        ${CIKIS}
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ---- Dünya ----------------------------------------------------------------

/**
 * Dünya yüzeyi: gündüz/gece dokuları arasında yumuşak terminatör, şehir ışıkları,
 * okyanuslarda küçük specular parlama, normal map ve bulut gölgeleri.
 */
export function dunyaMalzemesi({ gunduz, gece, yansima, normal, bulut }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uGunduz: { value: gunduz },
      uGece: { value: gece },
      uYansima: { value: yansima },
      uNormal: { value: normal },
      uBulut: { value: bulut },
      uBulutKayma: { value: 0 }, // bulut katmanının yüzeye göre u kayması
    },
    vertexShader: ORTAK_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D uGunduz;
      uniform sampler2D uGece;
      uniform sampler2D uYansima;
      uniform sampler2D uNormal;
      uniform sampler2D uBulut;
      uniform float uBulutKayma;
      varying vec2 vUv;
      varying vec3 vDunyaKonum;
      varying vec3 vDunyaNormal;
      varying vec3 vEksen;

      void main() {
        vec3 Ng = normalize(vDunyaNormal);
        vec3 L = normalize(-vDunyaKonum);
        vec3 V = normalize(cameraPosition - vDunyaKonum);

        // Küre için teğet uzayı: T doğuya, B kuzeye bakar.
        vec3 eksen = normalize(vEksen);
        vec3 T = normalize(cross(eksen, Ng) + vec3(1e-5));
        vec3 B = cross(Ng, T);
        vec3 nm = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
        nm.xy *= 0.9;
        vec3 N = normalize(T * nm.x + B * nm.y + Ng * nm.z);

        float nlGeo = dot(Ng, L);
        float nl = max(dot(N, L), 0.0);
        float gunduzOrani = smoothstep(-0.1, 0.22, nlGeo);

        vec3 gunduz = texture2D(uGunduz, vUv).rgb;
        vec3 gece = texture2D(uGece, vUv).rgb;
        float deniz = texture2D(uYansima, vUv).r;
        float bulut = texture2D(uBulut, vec2(vUv.x - uBulutKayma, vUv.y)).r;

        // Gündüz tarafı: dağınık ışık + bulut gölgesi
        vec3 renk = gunduz * nl * 0.92 * (1.0 - bulut * 0.32);

        // Terminatörde gün batımı sıcaklığı
        float alaca = smoothstep(-0.1, 0.04, nlGeo) * (1.0 - smoothstep(0.04, 0.32, nlGeo));
        renk *= mix(vec3(1.0), vec3(1.0, 0.68, 0.46), alaca * 0.55);

        // Okyanuslarda Güneş parlaması: küçük, yumuşak kenarlı, hafif sıcak bir
        // ışıltı ve çok zayıf geniş bir hale. Bulutların altında tamamen söner.
        vec3 H = normalize(L + V);
        vec3 Ns = normalize(mix(Ng, N, 0.25));
        float nh = max(dot(Ns, H), 0.0);
        float parlama = pow(nh, 900.0) * 0.2 + pow(nh, 120.0) * 0.035;
        float bulutsuz = 1.0 - smoothstep(0.08, 0.55, bulut);
        renk += vec3(1.0, 0.86, 0.66) * parlama * deniz * gunduzOrani * bulutsuz;

        // Gece tarafı: şehir ışıkları (bulutların altında sönükleşir) + çok hafif ortam ışığı
        renk += gece * vec3(1.0, 0.86, 0.62) * (1.0 - gunduzOrani) * 1.5 * (1.0 - bulut * 0.65);
        renk += gunduz * vec3(0.012, 0.016, 0.026);

        // Atmosferin yüzeye bindirdiği mavi pus
        float fresnel = pow(1.0 - max(dot(Ng, V), 0.0), 3.2);
        renk += vec3(0.25, 0.5, 1.0) * fresnel * (0.04 + 0.5 * smoothstep(-0.25, 0.5, nlGeo));

        gl_FragColor = vec4(renk, 1.0);
        ${CIKIS}
      }
    `,
  });
}

// ---- Atmosfer kabukları ---------------------------------------------------

/**
 * Gezegenin dışına taşan atmosfer halesi (BackSide, additive).
 * Kabuğun arka yüzü çizilir; gezegenin kenarında en parlak, dış kenarda sıfırdır.
 * `oran` = gezegen yarıçapı / kabuk yarıçapı.
 */
export function atmosferHaleMalzemesi({ renk, siddet = 1, oran }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRenk: { value: new THREE.Color(renk) },
      uSiddet: { value: siddet },
      uKenar: { value: Math.sqrt(1 - oran * oran) },
    },
    vertexShader: ORTAK_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uRenk;
      uniform float uSiddet;
      uniform float uKenar;
      varying vec3 vDunyaKonum;
      varying vec3 vDunyaNormal;

      void main() {
        vec3 N = normalize(vDunyaNormal);
        vec3 V = normalize(cameraPosition - vDunyaKonum);
        vec3 L = normalize(-vDunyaKonum);

        float nv = dot(N, V); // arka yüzde negatiftir
        float d = clamp(-nv / uKenar, 0.0, 1.0);
        float parilti = pow(d, 2.6);

        // Arka yüz normalini görüş düzlemine göre yansıtıp ön yüzdeki karşılığını bul:
        // böylece hale, gezegenin aydınlık kenarında parlar.
        vec3 Non = N - 2.0 * nv * V;
        float isik = smoothstep(-0.28, 0.5, dot(Non, L));

        gl_FragColor = vec4(uRenk * parilti * isik * uSiddet, 1.0);
        ${CIKIS}
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

/** Gezegen diskinin üstüne binen ince kenar pusu (FrontSide, additive fresnel). */
export function atmosferPusMalzemesi({ renk, siddet = 1 }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRenk: { value: new THREE.Color(renk) },
      uSiddet: { value: siddet },
    },
    vertexShader: ORTAK_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uRenk;
      uniform float uSiddet;
      varying vec3 vDunyaKonum;
      varying vec3 vDunyaNormal;

      void main() {
        vec3 N = normalize(vDunyaNormal);
        vec3 V = normalize(cameraPosition - vDunyaKonum);
        vec3 L = normalize(-vDunyaKonum);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        float isik = smoothstep(-0.2, 0.55, dot(N, L));
        gl_FragColor = vec4(uRenk * fresnel * isik * uSiddet, 1.0);
        ${CIKIS}
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// ---- Halkalar -------------------------------------------------------------

/**
 * Halka malzemesi: radyal şerit dokusu, iki yüzden aydınlanma ve gezegenin
 * halkaya düşen gölgesi (ışın–küre kesişimi).
 */
export function halkaMalzemesi({ doku, gezegenYaricap, ton = '#ffffff', opaklik = 1 }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDoku: { value: doku },
      uGezegenKonum: { value: new THREE.Vector3() },
      uGezegenYaricap: { value: gezegenYaricap },
      uTon: { value: new THREE.Color(ton) },
      uOpaklik: { value: opaklik },
    },
    vertexShader: ORTAK_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDoku;
      uniform vec3 uGezegenKonum;
      uniform float uGezegenYaricap;
      uniform vec3 uTon;
      uniform float uOpaklik;
      varying vec2 vUv;
      varying vec3 vDunyaKonum;
      varying vec3 vDunyaNormal;

      void main() {
        vec4 d = texture2D(uDoku, vec2(vUv.x, 0.5));
        vec3 N = normalize(vDunyaNormal);
        vec3 L = normalize(-vDunyaKonum);
        vec3 V = normalize(cameraPosition - vDunyaKonum);

        float nl = dot(N, L);
        float nv = dot(N, V);
        // Güneş'in aydınlattığı yüzden bakılıyorsa parlak; ters yüzden bakılıyorsa
        // yalnızca halkadan süzülen ışık görünür.
        float ayniYuz = step(0.0, nl * nv);
        float isik = mix(0.34, 1.0, ayniYuz) * (0.5 + 0.75 * sqrt(abs(nl)));

        // Gezegenin gölgesi: parçadan Güneş'e giden ışın gezegen küresini kesiyor mu?
        vec3 oc = vDunyaKonum - uGezegenKonum;
        float b = dot(oc, L);
        float uzaklik = sqrt(max(dot(oc, oc) - b * b, 0.0));
        float golge = b < 0.0
          ? smoothstep(uGezegenYaricap * 0.93, uGezegenYaricap * 1.02, uzaklik)
          : 1.0;

        vec3 renk = d.rgb * uTon * isik * (0.035 + 0.965 * golge);
        gl_FragColor = vec4(renk, d.a * uOpaklik);
        ${CIKIS}
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
}

/**
 * Standart Lambert malzemesine "halkanın gezegene düşen gölgesi"ni ekler.
 * Parçadan Güneş'e giden ışın halka düzlemini halka aralığında kesiyorsa,
 * o noktadaki halka opaklığı kadar ışık kısılır.
 */
export function halkaGolgesiEkle(malzeme, { doku, ic, dis }) {
  const u = {
    uHalkaDoku: { value: doku },
    uHalkaNormal: { value: new THREE.Vector3(0, 1, 0) },
    uHalkaMerkez: { value: new THREE.Vector3() },
    uHalkaIc: { value: ic },
    uHalkaDis: { value: dis },
  };
  malzeme.userData.halkaUniform = u;
  malzeme.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGolgeKonum;')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvGolgeKonum = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform sampler2D uHalkaDoku;
        uniform vec3 uHalkaNormal;
        uniform vec3 uHalkaMerkez;
        uniform float uHalkaIc;
        uniform float uHalkaDis;
        varying vec3 vGolgeKonum;`
      )
      .replace(
        '#include <lights_fragment_end>',
        /* glsl */ `#include <lights_fragment_end>
        {
          vec3 gL = normalize(-vGolgeKonum);
          float payda = dot(gL, uHalkaNormal);
          float golge = 1.0;
          if (abs(payda) > 1e-4) {
            float t = dot(uHalkaMerkez - vGolgeKonum, uHalkaNormal) / payda;
            if (t > 0.0) {
              float r = length(vGolgeKonum + gL * t - uHalkaMerkez);
              float u = (r - uHalkaIc) / (uHalkaDis - uHalkaIc);
              if (u > 0.0 && u < 1.0) {
                golge = 1.0 - texture2D(uHalkaDoku, vec2(u, 0.5)).a * 0.82;
              }
            }
          }
          reflectedLight.directDiffuse *= golge;
        }`
      );
  };
  malzeme.customProgramCacheKey = () => 'halka-golgesi';
  return malzeme;
}

// ---- Yıldızlar ------------------------------------------------------------

/** Hafifçe titreşen nokta yıldızlar. */
export function yildizMalzemesi(pikselOrani) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uZaman: { value: 0 },
      uPikselOrani: { value: pikselOrani },
    },
    vertexShader: /* glsl */ `
      attribute float aBoyut;
      attribute float aFaz;
      attribute vec3 aRenk;
      uniform float uZaman;
      uniform float uPikselOrani;
      varying vec3 vRenk;
      varying float vParlaklik;

      void main() {
        float titresim = 0.78 + 0.22 * sin(uZaman * (0.6 + fract(aFaz) * 1.8) + aFaz * 6.2831);
        vRenk = aRenk;
        vParlaklik = titresim;
        gl_PointSize = aBoyut * uPikselOrani * (0.85 + 0.15 * titresim);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vRenk;
      varying float vParlaklik;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(vRenk * vParlaklik * a * a, 1.0);
        ${CIKIS}
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
