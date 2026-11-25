'use strict';
/* =========================================================
   Character art — big-head cartoon style, SVG 120x240.
   Head parts are drawn in a 100x100 "head space" (centre 50,56)
   and scaled ×1.4 onto the body.
   ========================================================= */
const SKIN  = ['#FFE6D2', '#FDD3B5', '#F1BC94', '#DDA078', '#C1835A', '#9B6340', '#74472B', '#4E2F1C'];
const HAIRC = ['#1F1410', '#4A2C1D', '#7B4A2A', '#B5743A', '#E2AC48', '#F6DE96', '#E06A3A', '#C93A3A', '#F08CC0', '#A77CF0', '#4FB3F0', '#56C79A', '#EDEDED'];
const EYEC  = ['#3B2A20', '#2E6FD8', '#2F9A5C', '#7A4BC2', '#1E1E1E', '#C07A2C', '#E0529C'];
const CLOTH = ['#FF6B8B', '#FF9F43', '#FECA57', '#1DD1A1', '#48DBFB', '#5F7FFF', '#A55EEA', '#F7A8D8', '#FFFFFF', '#E84E4E', '#8BD17C', '#3A4256', '#9B6B4A', '#40C4C4'];
const NAMES = ['נועה', 'מאיה', 'תמר', 'יואב', 'שירה', 'דניאל', 'ליה', 'אורי', 'רוני', 'עדי', 'אלה', 'גיא', 'הילה', 'איתי', 'מיקה', 'בן'];

const OPTS = {
  hair:   ['long', 'wavy', 'pigtails', 'ponytail', 'buns', 'braid', 'bob', 'afro', 'curly', 'short', 'sidepart', 'spiky', 'mohawk', 'bald'],
  eyes:   ['round', 'big', 'sparkle', 'lashes', 'happy', 'wink'],
  mouth:  ['smile', 'grin', 'tongue', 'cat', 'smirk', 'o'],
  face:   ['none', 'blush', 'freckles', 'star', 'heart'],
  top:    ['tshirt', 'heart', 'stripes', 'tank', 'hoodie', 'sweater', 'jacket', 'overalls', 'dress', 'princess'],
  bottom: ['pants', 'jeans', 'leggings', 'shorts', 'skirt', 'tutu'],
  shoe:   ['sneakers', 'boots', 'sandals', 'flats'],
  acc:    ['none', 'bow', 'flower', 'headband', 'crown', 'catears', 'cap', 'glasses', 'sunglasses', 'headphones'],
};
const DEFAULT_LOOK = { skin: SKIN[1], hair: 'long', hairColor: HAIRC[2], eyes: 'round', eyeColor: EYEC[0], mouth: 'smile', face: 'none',
  top: 'tshirt', topColor: CLOTH[0], bottom: 'pants', bottomColor: CLOTH[5], shoe: 'sneakers', shoes: CLOTH[8], acc: 'none', accColor: CLOTH[6] };

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
function randomLook() {
  const l = {};
  for (const k in OPTS) l[k] = rnd(OPTS[k]);
  if (l.hair === 'bald' && Math.random() < .8) l.hair = 'long';
  Object.assign(l, { skin: rnd(SKIN), hairColor: rnd(HAIRC.slice(0, 9)), eyeColor: rnd(EYEC), topColor: rnd(CLOTH), bottomColor: rnd(CLOTH), shoes: rnd(CLOTH), accColor: rnd(CLOTH) });
  if (Math.random() < .5) l.face = 'none';
  return l;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
// fill + soft outline
const ln = (c, w = 1.4) => `fill="${c}" stroke="${shade(c, -0.32)}" stroke-width="${w}" stroke-linejoin="round"`;

let uid = 0;
function charSVG(look, o = {}) {
  const L = Object.assign({}, DEFAULT_LOOK, look);
  const pose = o.pose || 'stand', ex = o.expr || '', vb = o.vb || '0 0 120 240';
  const id = 'c' + (uid++);
  const sk = L.skin, hc = L.hairColor, tc = L.topColor, bc = L.bottomColor, ac = L.accColor;
  const longTop = L.top === 'dress' || L.top === 'princess';
  const overalls = L.top === 'overalls';
  const H = ln(hc, 1);

  /* ---------------- hair (head space) ---------------- */
  const cap = `<path d="M19,58 Q15,15 50,15 Q85,15 81,58 Q78,42 66,34 Q52,44 36,36 Q24,42 19,58Z" ${H}/>`;
  let hb = '', hf = cap;
  switch (L.hair) {
    case 'short': hf = `<path d="M20,54 Q18,17 50,17 Q82,17 80,54 Q77,36 62,31 Q46,38 30,33 Q22,40 20,54Z" ${H}/>`; break;
    case 'long': hb = `<path d="M16,54 Q14,13 50,13 Q86,13 84,54 L90,122 Q70,130 50,124 Q30,130 10,122Z" ${H}/>`; break;
    case 'wavy': hb = `<path d="M16,52 Q14,13 50,13 Q86,13 84,52 Q94,68 86,84 Q96,100 88,118 Q70,130 50,124 Q30,130 12,118 Q4,100 14,84 Q6,68 16,52Z" ${H}/>`; break;
    case 'ponytail': hb = `<path d="M72,30 Q102,36 96,80 Q92,104 80,114 Q88,84 74,52Z" ${H}/>`; hf = cap + `<circle cx="79" cy="33" r="5.5" ${ln(ac, 1)}/>`; break;
    case 'pigtails': hb = `<path d="M22,40 Q-4,50 4,92 Q8,108 18,114 Q12,84 26,58Z" ${H}/><path d="M78,40 Q104,50 96,92 Q92,108 82,114 Q88,84 74,58Z" ${H}/>`;
      hf = cap + `<circle cx="21" cy="44" r="5" ${ln(ac, 1)}/><circle cx="79" cy="44" r="5" ${ln(ac, 1)}/>`; break;
    case 'buns': hb = `<circle cx="23" cy="24" r="14" ${H}/><circle cx="77" cy="24" r="14" ${H}/>`; break;
    case 'braid': hb = `<path d="M18,56 Q14,13 50,13 Q86,13 82,56Z" ${H}/>`;
      hf = cap + [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${80 + i * 0.6}" cy="${64 + i * 11}" rx="${9 - i * 0.5}" ry="7.5" ${H}/>`).join('') + `<circle cx="84" cy="128" r="4.5" ${ln(ac, 1)}/>`; break;
    case 'bob': hb = `<path d="M15,54 Q14,13 50,13 Q86,13 85,54 L86,90 Q80,95 74,89 L26,89 Q20,95 14,90Z" ${H}/>`;
      hf = `<path d="M19,56 Q16,15 50,15 Q84,15 81,56 L80,45 Q50,50 20,45Z" ${H}/>`; break;
    case 'afro': hb = `<circle cx="50" cy="44" r="40" ${H}/><circle cx="18" cy="62" r="17" ${H}/><circle cx="82" cy="62" r="17" ${H}/>`;
      hf = `<path d="M20,52 Q18,22 50,20 Q82,22 80,52 Q74,38 64,40 Q56,32 48,38 Q38,32 32,42 Q24,42 20,52Z" ${H}/>`; break;
    case 'curly':
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (1 + i / 10);
        hb += `<circle cx="${(50 + 35 * Math.cos(a)).toFixed(1)}" cy="${(56 + 38 * Math.sin(a)).toFixed(1)}" r="11" ${H}/>`;
      }
      hb += `<circle cx="15" cy="72" r="10" ${H}/><circle cx="85" cy="72" r="10" ${H}/><circle cx="17" cy="88" r="8" ${H}/><circle cx="83" cy="88" r="8" ${H}/>`; break;
    case 'spiky': hf = `<path d="M20,54 L14,30 L28,34 L27,12 L40,25 L50,6 L60,25 L73,12 L72,34 L86,30 L80,54 Q76,38 50,36 Q24,38 20,54Z" ${H}/>`; break;
    case 'mohawk': hf = `<path d="M22,50 Q24,30 38,28 L40,36 Q28,40 22,50Z M78,50 Q76,30 62,28 L60,36 Q72,40 78,50Z" fill="${hc}" opacity=".55"/><path d="M38,32 Q36,4 50,-4 Q64,4 62,32 Q50,26 38,32Z" ${H}/>`; break;
    case 'sidepart': hf = `<path d="M19,60 Q13,14 54,14 Q88,16 81,58 Q79,38 66,30 Q44,30 28,46 Q22,52 19,60Z" ${H}/>`; break;
    case 'bald': hf = ''; break;
  }

  /* ---------------- face ---------------- */
  let eyeS = L.eyes, mouthS = L.mouth;
  if (ex === 'happy') { eyeS = 'happy'; mouthS = 'grin'; }
  if (ex === 'yum') { eyeS = 'happy'; mouthS = 'tongue'; }
  if (ex === 'surprised') { mouthS = 'o'; if (eyeS === 'happy' || eyeS === 'wink') eyeS = 'round'; }
  if (ex === 'sleep') { eyeS = 'closed'; mouthS = 'small'; }
  if (ex === 'eat') { mouthS = 'chew'; }
  const ec = L.eyeColor;
  const roundEye = (x) => `<ellipse cx="${x}" cy="58" rx="6" ry="7" fill="#fff" stroke="#00000022"/><circle cx="${x}" cy="59" r="4.3" fill="${ec}"/><circle cx="${x}" cy="59" r="2.1" fill="#111"/><circle cx="${x + 1.6}" cy="57" r="1.5" fill="#fff"/>`;
  const bigEye = (x, star) => `<ellipse cx="${x}" cy="58" rx="7.5" ry="9" fill="#fff" stroke="#00000022"/><ellipse cx="${x}" cy="59.5" rx="5.7" ry="7" fill="${ec}"/><ellipse cx="${x}" cy="61.5" rx="4.5" ry="4" fill="${shade(ec, 0.25)}" opacity=".6"/><circle cx="${x}" cy="60" r="2.9" fill="#111"/>` +
    (star ? `<path d="M${x + 2},${53.5} l1,2.4 2.5,.3 -1.9,1.6 .6,2.5 -2.2,-1.3 -2.2,1.3 .6,-2.5 -1.9,-1.6 2.5,-.3Z" fill="#fff"/>` : `<circle cx="${x + 2}" cy="56.3" r="2.1" fill="#fff"/>`) + `<circle cx="${x - 2}" cy="62.5" r="1" fill="#fff"/>`;
  const arc = (x) => `<path d="M${x - 6},60 Q${x},52 ${x + 6},60" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  let eyes;
  switch (eyeS) {
    case 'big': eyes = bigEye(39) + bigEye(61); break;
    case 'sparkle': eyes = bigEye(39, 1) + bigEye(61, 1); break;
    case 'lashes': eyes = roundEye(39) + roundEye(61) + `<path d="M34,53 L30,50 M36.5,51.5 L34.5,48 M66,53 L70,50 M63.5,51.5 L65.5,48" stroke="#222" stroke-width="1.7" stroke-linecap="round"/>`; break;
    case 'happy': eyes = arc(39) + arc(61); break;
    case 'wink': eyes = roundEye(39) + arc(61); break;
    case 'closed': eyes = `<path d="M33,58 Q39,63 45,58 M55,58 Q61,63 67,58" stroke="#3a2a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; break;
    default: eyes = roundEye(39) + roundEye(61);
  }
  const browC = shade(hc === '#EDEDED' || hc === '#F6DE96' ? '#b89a70' : hc, -0.1);
  const brows = `<path d="M33,47.5 Q39,44.5 45,47.5 M55,47.5 Q61,44.5 67,47.5" stroke="${browC}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const smile = `<path d="M43,71 Q50,78 57,71" stroke="#9b3b33" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  let mouth;
  switch (mouthS) {
    case 'grin': mouth = `<path d="M41,69.5 L59,69.5 Q58,81 50,81 Q42,81 41,69.5Z" fill="#8f2d2d"/><rect x="43" y="69.5" width="14" height="3.2" rx="1" fill="#fff"/><path d="M45,77.5 Q50,74 55,77.5 Q53,81 50,81 Q47,81 45,77.5Z" fill="#ff8a8a"/>`; break;
    case 'tongue': mouth = smile + `<path d="M47.5,74.5 Q47.5,80.5 50.8,80.5 Q54,80.5 54,74Z" fill="#ff7b8f"/>`; break;
    case 'cat': mouth = `<path d="M43,71 Q46.5,76 50,71 Q53.5,76 57,71" stroke="#9b3b33" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; break;
    case 'smirk': mouth = `<path d="M43,74 Q52,77 58,69" stroke="#9b3b33" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; break;
    case 'o': mouth = `<ellipse cx="50" cy="74" rx="4" ry="5" fill="#8f2d2d"/>`; break;
    case 'small': mouth = `<ellipse cx="50" cy="73" rx="2.4" ry="2" fill="#8f2d2d"/>`; break;
    case 'chew': mouth = `<g class="chew"><ellipse cx="50" cy="73" rx="6" ry="4.5" fill="#8f2d2d"/></g>`; break;
    default: mouth = smile;
  }
  let cheeks = `<circle cx="31" cy="68" r="5" fill="#ff8fa3" opacity=".45"/><circle cx="69" cy="68" r="5" fill="#ff8fa3" opacity=".45"/>`;
  switch (L.face) {
    case 'blush': cheeks = `<ellipse cx="30" cy="68" rx="7" ry="5" fill="#ff7896" opacity=".65"/><ellipse cx="70" cy="68" rx="7" ry="5" fill="#ff7896" opacity=".65"/>`; break;
    case 'freckles': cheeks += `<g fill="${shade(sk, -0.35)}"><circle cx="27" cy="64" r="1.1"/><circle cx="31" cy="66" r="1.1"/><circle cx="28" cy="69" r="1.1"/><circle cx="73" cy="64" r="1.1"/><circle cx="69" cy="66" r="1.1"/><circle cx="72" cy="69" r="1.1"/></g>`; break;
    case 'star': cheeks += `<path d="M71,62 l1.8,3.8 4.2,.6 -3,2.9 .7,4.1 -3.7,-2 -3.7,2 .7,-4.1 -3,-2.9 4.2,-.6Z" fill="#FFD43B" stroke="#E0A400" stroke-width=".8"/>`; break;
    case 'heart': cheeks += `<path d="M71,72 Q64,67 66.5,63.5 Q69,61 71,64 Q73,61 75.5,63.5 Q78,67 71,72Z" fill="#FF5C8A"/>`; break;
  }

  /* ---------------- accessories (head space) ---------------- */
  let accBack = '', acc = '';
  switch (L.acc) {
    case 'glasses': acc = `<g fill="rgba(255,255,255,.25)" stroke="${ac === '#FFFFFF' ? '#3A4256' : ac}" stroke-width="2.4"><circle cx="39" cy="58" r="9"/><circle cx="61" cy="58" r="9"/><path d="M48,58 L52,58 M30,57 L21,54 M70,57 L79,54" fill="none"/></g>`; break;
    case 'sunglasses': acc = `<g stroke="#222" stroke-width="2"><path d="M29,52 L48,52 Q48,66 38,66 Q29,66 29,52Z M52,52 L71,52 Q71,66 62,66 Q52,66 52,52Z" fill="${ac === '#FFFFFF' ? '#222' : shade(ac, -0.45)}"/><path d="M48,54 L52,54 M29,53 L21,51 M71,53 L79,51" fill="none"/></g><path d="M32,55 L37,55" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`; break;
    case 'bow': acc = `<path d="M70,22 L57,13 L57,31Z M70,22 L83,13 L83,31Z" ${ln(ac, 1)}/><circle cx="70" cy="22" r="4.5" fill="${shade(ac, -0.2)}"/>`; break;
    case 'cap': acc = `<path d="M18,46 Q18,11 50,11 Q82,11 82,46Z" ${ln(ac, 1)}/><path d="M50,41 Q82,36 100,47 Q80,50 50,47Z" fill="${shade(ac, -0.22)}"/><circle cx="50" cy="12" r="3.5" fill="${shade(ac, -0.22)}"/>`; break;
    case 'crown': acc = `<path d="M30,27 L29,7 L40,17 L50,2 L60,17 L71,7 L70,27Z" fill="#FFC93C" stroke="#E0A400" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="18" r="3.5" fill="${ac}"/><circle cx="37" cy="22" r="2.2" fill="${ac}"/><circle cx="63" cy="22" r="2.2" fill="${ac}"/>`; break;
    case 'flower': acc = `<g transform="translate(73 25)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(7 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(7 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="5.5" ${ln(ac, .8)}/>`).join('')}<circle r="4.2" fill="#FFD43B"/></g>`; break;
    case 'headband': acc = `<path d="M19,46 Q22,16 50,15 Q78,16 81,46" stroke="${ac}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M19,46 Q22,16 50,15 Q78,16 81,46" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>`; break;
    case 'catears': accBack = `<path d="M20,36 L22,4 L44,22Z M80,36 L78,4 L56,22Z" ${ln(ac, 1)}/><path d="M24,28 L25,12 L37,22Z M76,28 L75,12 L63,22Z" fill="#FFB3C7"/>`; break;
    case 'headphones': acc = `<path d="M17,56 Q14,8 50,8 Q86,8 83,56" stroke="${shade(ac, -0.25)}" stroke-width="5" fill="none"/><rect x="10" y="48" width="14" height="22" rx="6" ${ln(ac, 1)}/><rect x="76" y="48" width="14" height="22" rx="6" ${ln(ac, 1)}/>`; break;
  }

  /* ---------------- body (body space 120x240) ---------------- */
  const pantsLeg = !longTop && !overalls && ['pants', 'jeans', 'leggings'].includes(L.bottom);
  const legC = overalls ? tc : pantsLeg ? bc : sk;
  const shoe = (x, y) => {
    const c = L.shoes;
    switch (L.shoe) {
      case 'boots': return `<path d="M${x - 2},${y - 32} L${x + 16},${y - 32} L${x + 17},${y - 7} Q${x + 22},${y - 7} ${x + 22},${y} L${x - 4},${y}Z" ${ln(c)}/><rect x="${x - 4}" y="${y - 3}" width="26" height="4" rx="2" fill="${shade(c, -0.35)}"/>`;
      case 'sandals': return `<path d="M${x - 4},${y - 2} Q${x - 4},${y - 12} ${x + 7},${y - 12} Q${x + 19},${y - 12} ${x + 19},${y - 2}Z" ${ln(sk)}/><path d="M${x - 2},${y - 8} L${x + 17},${y - 8}" stroke="${c}" stroke-width="4"/><rect x="${x - 5}" y="${y - 3}" width="25" height="4" rx="2" fill="${shade(c, -0.25)}"/>`;
      case 'flats': return `<path d="M${x - 3},${y} Q${x - 3},${y - 11} ${x + 7},${y - 11} Q${x + 18},${y - 11} ${x + 18},${y}Z" ${ln(c)}/><circle cx="${x + 7}" cy="${y - 8}" r="2.6" fill="#fff"/>`;
      default: return `<path d="M${x - 4},${y - 2} Q${x - 4},${y - 16} ${x + 7},${y - 16} Q${x + 21},${y - 16} ${x + 21},${y - 2}Z" ${ln(c)}/><rect x="${x - 5}" y="${y - 4}" width="27" height="5" rx="2.5" fill="#fff" stroke="${shade(c, -0.3)}" stroke-width="1"/><path d="M${x + 3},${y - 11} L${x + 11},${y - 11}" stroke="${c === '#FFFFFF' ? '#aaa' : '#fff'}" stroke-width="2" stroke-linecap="round"/>`;
    }
  };
  let legs;
  if (pose === 'sit') {
    const lapC = longTop || overalls ? tc : (L.bottom === 'shorts' || pantsLeg || L.bottom === 'skirt' || L.bottom === 'tutu') ? bc : sk;
    const low = (x) => `<rect x="${x}" y="168" width="14" height="38" rx="6" ${ln(pantsLeg || overalls ? legC : sk)}/>` + shoe(x, 214);
    legs = low(44) + low(62) + `<rect x="38" y="150" width="44" height="28" rx="11" ${ln(lapC)}/>`;
  } else {
    const leg = (x, cls) => `<g class="leg ${cls}"><rect x="${x}" y="158" width="14" height="72" rx="6" ${ln(legC)}/>` +
      ((!longTop && !overalls && L.bottom === 'shorts') ? `<rect x="${x - 1}" y="156" width="16" height="24" rx="4" ${ln(bc)}/>` : '') +
      ((pantsLeg && L.bottom === 'jeans') ? `<rect x="${x - 1}" y="214" width="16" height="7" rx="2" fill="${shade(bc, -0.15)}"/>` : '') +
      shoe(x, 236) + `</g>`;
    legs = leg(44, 'leg-l') + leg(62, 'leg-r');
  }

  let hips = '';
  if (!longTop && !overalls) {
    switch (L.bottom) {
      case 'skirt': hips = `<path d="M38,150 L82,150 L94,190 Q60,198 26,190Z" ${ln(bc)}/><rect x="37" y="149" width="46" height="7" rx="3" fill="${shade(bc, -0.15)}"/>`; break;
      case 'tutu': hips = `<path d="M36,150 L84,150 Q100,166 106,182 Q98,186 92,181 Q86,188 78,183 Q72,189 64,184 Q58,190 50,184 Q44,189 38,183 Q30,188 24,181 Q18,186 14,182 Q20,166 36,150Z" ${ln(bc)}/><path d="M40,150 L80,150 Q90,160 94,170 Q60,178 26,170 Q30,160 40,150Z" fill="${shade(bc, 0.3)}" opacity=".8"/>`; break;
      default: hips = `<rect x="37" y="148" width="46" height="24" rx="8" ${ln(bc)}/>` +
        (L.bottom === 'jeans' ? `<path d="M60,150 L60,170 M42,154 Q47,160 52,154 M68,154 Q73,160 78,154" stroke="${shade(bc, 0.35)}" stroke-width="1.4" fill="none"/>` : '');
    }
  }

  const T = 'M37,120 Q37,106 50,106 L70,106 Q83,106 83,120 L84,160 Q60,166 36,160Z';
  const collar = `<path d="M51,106 Q60,115 69,106" stroke="${shade(tc, -0.2)}" stroke-width="2.6" fill="none"/>`;
  const contrast = tc === '#FFFFFF' || tc === '#FECA57' || tc === '#F7A8D8' ? '#FF5C8A' : '#fff';
  let torso = '', sleeve = 24, sleeveC = tc;
  switch (L.top) {
    case 'heart': torso = `<path d="${T}" ${ln(tc)}/>${collar}<path d="M60,146 Q45,134 50,126 Q55,119 60,127 Q65,119 70,126 Q75,134 60,146Z" fill="${contrast}"/>`; break;
    case 'stripes': torso = `<clipPath id="${id}s"><path d="${T}"/></clipPath><path d="${T}" ${ln(tc)}/><g clip-path="url(#${id}s)" fill="${tc === '#FFFFFF' ? '#5F7FFF' : '#fff'}" opacity=".75"><rect x="20" y="116" width="80" height="6"/><rect x="20" y="130" width="80" height="6"/><rect x="20" y="144" width="80" height="6"/></g>${collar}`; break;
    case 'tank': sleeve = 0; torso = `<path d="M42,120 L45,106 L52,106 Q60,116 68,106 L75,106 L78,120 L84,160 Q60,166 36,160Z" ${ln(tc)}/>`; break;
    case 'hoodie': sleeve = 52; torso = `<path d="${T}" ${ln(tc)}/><path d="M46,138 L74,138 L72,156 L48,156Z" fill="${shade(tc, -0.12)}"/><path d="M44,106 Q60,126 76,106" stroke="${shade(tc, -0.22)}" stroke-width="5" fill="none"/><path d="M55,116 L54,132 M65,116 L66,132" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`; break;
    case 'sweater': sleeve = 52; torso = `<path d="${T}" ${ln(tc)}/><path d="M38,128 L46,122 L54,128 L62,122 L70,128 L78,122 L83,126" stroke="${contrast}" stroke-width="3" fill="none" opacity=".85"/><rect x="36" y="152" width="48" height="9" rx="4" fill="${shade(tc, -0.15)}"/><path d="M50,106 Q60,112 70,106" stroke="${shade(tc, -0.2)}" stroke-width="4" fill="none"/>`; break;
    case 'jacket': sleeve = 52; torso = `<path d="${T}" ${ln('#FFFFFF')}/><path d="M37,120 Q37,106 50,106 L54,106 L57,164 Q46,164 36,160Z" ${ln(tc)}/><path d="M83,120 Q83,106 70,106 L66,106 L63,164 Q74,164 84,160Z" ${ln(tc)}/><circle cx="53" cy="128" r="1.8" fill="${shade(tc, -0.3)}"/><circle cx="53" cy="142" r="1.8" fill="${shade(tc, -0.3)}"/>`; break;
    case 'overalls': {
      const shirt = tc === '#FFFFFF' ? '#FFE08A' : '#FFFFFF';
      sleeveC = shirt;
      torso = `<path d="${T}" ${ln(shirt)}/><rect x="37" y="146" width="46" height="26" rx="8" ${ln(tc)}/><rect x="46" y="124" width="28" height="30" rx="4" ${ln(tc)}/><path d="M46,126 L42,108 M74,126 L78,108" stroke="${tc}" stroke-width="5" stroke-linecap="round"/><circle cx="49" cy="128" r="2" fill="#FECA57"/><circle cx="71" cy="128" r="2" fill="#FECA57"/><rect x="54" y="132" width="12" height="9" rx="2" fill="${shade(tc, -0.12)}"/>`; break;
    }
    case 'dress': torso = `<path d="M40,116 Q40,106 50,106 L70,106 Q80,106 80,116 L98,198 Q60,208 22,198Z" ${ln(tc)}/><rect x="36" y="138" width="48" height="6" fill="${shade(tc, -0.15)}"/>${collar}<path d="M26,190 Q60,200 94,190" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="4 4" opacity=".8"/>`; break;
    case 'princess': sleeve = 'puff'; torso = `<path d="M40,142 L80,142 Q104,190 110,228 Q60,240 10,228 Q16,190 40,142Z" ${ln(tc)}/><path d="M30,200 Q60,214 90,200 Q98,214 104,226 Q60,236 16,226 Q22,214 30,200Z" fill="${shade(tc, 0.3)}"/><path d="M42,116 Q42,106 50,106 L70,106 Q78,106 78,116 L81,146 L39,146Z" ${ln(tc)}/><path d="M50,108 Q60,118 70,108" stroke="#fff" stroke-width="2" fill="none"/>` +
      `<g fill="#fff" opacity=".9"><circle cx="40" cy="186" r="1.6"/><circle cx="62" cy="170" r="1.6"/><circle cx="80" cy="192" r="1.6"/><circle cx="52" cy="212" r="1.6"/><circle cx="88" cy="214" r="1.6"/></g><circle cx="60" cy="126" r="4" fill="#FFD43B" stroke="#E0A400"/>`; break;
    default: torso = `<path d="${T}" ${ln(tc)}/>${collar}<circle cx="60" cy="134" r="7" fill="${shade(tc, tc === '#FFFFFF' ? -0.15 : 0.35)}"/>`;
  }
  const arm = (x, cls) => `<g class="arm ${cls}"><rect x="${x}" y="110" width="13" height="54" rx="6.5" ${ln(sk)}/>` +
    (sleeve === 'puff' ? `<circle cx="${x + 6.5}" cy="114" r="11" ${ln(tc)}/>` : sleeve ? `<rect x="${x - 0.5}" y="108" width="14" height="${sleeve}" rx="7" ${ln(sleeveC)}/>` : '') +
    (sleeve === 52 ? `<rect x="${x - 0.5}" y="153" width="14" height="7" rx="3" fill="${shade(sleeveC, -0.15)}"/>` : '') +
    `<circle cx="${x + 6.5}" cy="166" r="8" ${ln(sk)}/></g>`;

  const HS = 'transform="translate(60 64) scale(1.4) translate(-50 -56)"';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><g class="body">` +
    `<g ${HS}>${hb}</g>` + legs + hips +
    `<rect x="53" y="96" width="14" height="16" fill="${shade(sk, -0.12)}"/>` +
    arm(24, 'arm-l') + arm(83, 'arm-r') + torso +
    `<g ${HS}>${accBack}<circle cx="20" cy="60" r="6" ${ln(sk, 1)}/><circle cx="80" cy="60" r="6" ${ln(sk, 1)}/>` +
    `<ellipse cx="50" cy="56" rx="30" ry="31" ${ln(sk, 1)}/>${cheeks}<g class="eyes">${eyes}</g>${brows}${mouth}${hf}${acc}</g>` +
    `</g></svg>`;
}
