'use strict';
/* =========================================================
   More places: farm, pool, street of houses, café, boutique,
   school, clinic, a second house (kids' room) and a castle.
   Then the final world order + layout.
   ========================================================= */
const skyG = (w, id, top = '#78C6F7', bot = '#DDF2FF') => `<defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
  <rect width="${w}" height="900" fill="url(#sky${id})"/>
  <g class="drift" style="--w:${w + 500}px;animation-duration:${70 + w % 30}s">${cloud(-180, 130, 0.9)}${cloud(-w * 0.5, 220, 0.7)}${cloud(-w * 0.9, 100, 0.55)}</g>`;
const windowInner = `<rect x="-150" y="-290" width="300" height="250" rx="120" fill="#fff"/><rect x="-136" y="-276" width="272" height="222" rx="108" class="wsky" fill="#9AD8FF"/><circle cx="60" cy="-200" r="30" fill="#FFD43B" class="wsun"/><g class="wmoon"><circle cx="60" cy="-200" r="30" fill="#FFF3B0"/><circle cx="74" cy="-210" r="26" fill="#1d2357"/></g><g class="wstars" fill="#FFF3B0"><circle cx="-60" cy="-210" r="4"/><circle cx="-20" cy="-140" r="3"/><circle cx="-90" cy="-120" r="3.5"/><circle cx="10" cy="-230" r="3"/></g><rect x="-6" y="-276" width="12" height="222" fill="#fff"/><rect x="-136" y="-160" width="272" height="10" fill="#fff"/><rect x="-170" y="-50" width="340" height="18" rx="8" fill="#fff"/>`;
const lampPost = (x) => P('lamp', x, 760, 1, `<circle cy="-400" r="110" fill="#FFF3A0" opacity=".6" class="glow"/><rect x="-8" y="-380" width="16" height="380" ${ln('#3A4256', 2)}/><path d="M-34,-380 L34,-380 L22,-430 L-22,-430Z" ${ln('#FECA57', 3)}/><rect x="-22" y="-10" width="44" height="12" rx="4" fill="#3A4256"/>`);
const houseFacade = (x, w, h, body, roof, door) => {
  const top = FT - h;
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${h}" ${ln(body, 3)}/><path d="M${x - 24},${top + 4} L${x + w / 2},${top - 120} L${x + w + 24},${top + 4}Z" ${ln(roof, 3)}/>`;
  s += `<rect x="${x + w / 2 - 38}" y="${FT - 150}" width="76" height="150" rx="30" ${ln(door, 3)}/><circle cx="${x + w / 2 + 22}" cy="${FT - 70}" r="6" fill="#FFD43B"/>`;
  for (const wx of [x + 22, x + w - 92]) s += `<rect x="${wx}" y="${top + 30}" width="70" height="70" rx="8" fill="#fff"/><rect x="${wx + 6}" y="${top + 36}" width="58" height="58" rx="4" fill="#9AD8FF"/><path d="M${wx + 35},${top + 36} L${wx + 35},${top + 94} M${wx + 6},${top + 65} L${wx + 64},${top + 65}" stroke="#fff" stroke-width="5"/><rect x="${wx - 4}" y="${top + 100}" width="78" height="14" rx="5" fill="${roof}"/>${[0, 1, 2].map(i => `<circle cx="${wx + 12 + i * 23}" cy="${top + 98}" r="8" fill="${['#FF6B8B', '#FECA57', '#A55EEA'][i]}"/>`).join('')}`;
  return s;
};
const chairBack = (x, c = '#B8753A') => `<rect x="${x - 44}" y="530" width="88" height="20" rx="8" ${ln(c, 2)}/><rect x="${x - 40}" y="530" width="12" height="130" fill="${c}"/><rect x="${x + 28}" y="530" width="12" height="130" fill="${c}"/><rect x="${x - 50}" y="648" width="100" height="16" rx="6" ${ln(c, 2)}/><rect x="${x - 44}" y="664" width="10" height="56" fill="${shade(c, -0.25)}"/><rect x="${x + 34}" y="664" width="10" height="56" fill="${shade(c, -0.25)}"/>`;

const MORE = {
  /* ------------------------------ FARM ------------------------------ */
  farm: {
    key: 'farm', name: 'חווה', icon: '🐮', w: 1900, color: '#E3F5C8',
    draw: (w) => skyG(w, 'F') + `
      ${P('sun', 1650, 150, 0.9, sunInner())}
      <path d="M0,560 Q300,420 640,540 Q950,440 1260,530 Q1580,450 ${w},520 L${w},640 L0,640Z" fill="#A6DC93"/>
      <rect y="${FT}" width="${w}" height="${900 - FT}" fill="#8FCF6B"/>
      <path d="M600,${FT} Q560,760 420,900 L760,900 Q760,760 720,${FT}Z" fill="#D9B98A" opacity=".85"/>
      ${Array.from({ length: 18 }, (_, i) => `<rect x="${760 + i * 64}" y="540" width="14" height="80" rx="4" fill="#B8753A"/>`).join('')}<rect x="750" y="556" width="${w - 750}" height="12" fill="#C9874B"/><rect x="750" y="590" width="${w - 750}" height="12" fill="#C9874B"/>
      ${P('barn', 300, 680, 1, `<path d="M-210,0 L-210,-270 L0,-420 L210,-270 L210,0Z" ${ln('#D9443A', 3)}/><path d="M-232,-258 L0,-430 L232,-258" stroke="#fff" stroke-width="18" fill="none" stroke-linejoin="round"/><rect x="-85" y="-180" width="170" height="180" fill="#B83228" stroke="#fff" stroke-width="8"/><path d="M-85,-180 L85,0 M85,-180 L-85,0" stroke="#fff" stroke-width="8"/><rect x="-44" y="-330" width="88" height="66" fill="#fff"/><rect x="-36" y="-322" width="72" height="50" fill="#6b3a1a"/>`)}
      ${P('hen', 860, 740, 1, `<ellipse cy="-40" rx="46" ry="38" ${ln('#fff', 3)}/><circle cx="-34" cy="-80" r="24" ${ln('#fff', 3)}/><path d="M-44,-102 q4,-14 10,0 q4,-14 10,0" fill="#E84E4E"/><path d="M-58,-80 L-74,-74 L-58,-70Z" fill="#FF9F43"/><circle cx="-40" cy="-84" r="4" fill="#222"/><path d="M40,-60 q26,-20 20,10" fill="#eee" stroke="#ccc" stroke-width="3"/><path d="M-10,-4 L-10,10 M10,-4 L10,10" stroke="#FF9F43" stroke-width="5"/>`)}
      <g><rect x="1080" y="590" width="190" height="96" rx="24" ${ln('#F2C94C', 3)}/>${[0, 1, 2, 3].map(i => `<path d="M${1100 + i * 44},600 L${1110 + i * 44},676" stroke="#D9AE2E" stroke-width="4"/>`).join('')}</g>
      ${P('tractor', 1560, 740, 1, `<rect x="-150" y="-150" width="220" height="90" rx="16" ${ln('#3FA34D', 3)}/><rect x="-10" y="-260" width="110" height="130" rx="12" ${ln('#3FA34D', 3)}/><rect x="6" y="-244" width="78" height="70" rx="8" fill="#BEE6FF"/><rect x="-130" y="-200" width="16" height="56" fill="#555"/><circle cx="50" cy="-60" r="62" ${ln('#333', 3)}/><circle cx="50" cy="-60" r="26" fill="#FECA57"/><circle cx="-110" cy="-40" r="40" ${ln('#333', 3)}/><circle cx="-110" cy="-40" r="16" fill="#FECA57"/>`)}
      ${[[80, '#FECA57'], [520, '#FF9F43'], [1000, '#FECA57'], [1350, '#FF6B8B'], [1800, '#FECA57']].map(([x, c], i) => P('flower', x, 885 - (i % 2) * 30, 1, flowerInner(c))).join('')}`,
    seats: [{ x: 1175, y: 596, kind: 'sit', scale: 0.95, z: 690 }],
    surfaces: [],
    items: [['🐷', 1000, 810], ['🐮', 1380, 790], ['🐔', 620, 830], ['🐑', 160, 820]],
  },
  /* ------------------------------ POOL ------------------------------ */
  pool: {
    key: 'pool', name: 'בריכה', icon: '🏊', w: 1700, color: '#C9F0FF',
    draw: (w) => skyG(w, 'O', '#6CC4FF', '#E2F6FF') + `
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<circle cx="${i * 150 + 40}" cy="${560 - (i % 3) * 14}" r="${70 + (i % 2) * 20}" fill="${i % 2 ? '#58BC5C' : '#47A84E'}"/>`).join('')}
      <rect y="${FT - 30}" width="${w}" height="${930 - FT}" fill="#F4E9D8"/>
      ${Array.from({ length: Math.ceil(w / 80) }, (_, i) => `<path d="M${i * 80},${FT - 30} L${i * 80},900" stroke="#E6D6BD" stroke-width="3"/>`).join('')}${[660, 740, 830].map(y => `<path d="M0,${y} L${w},${y}" stroke="#E6D6BD" stroke-width="3"/>`).join('')}
      <rect x="300" y="680" width="820" height="190" rx="24" fill="#2FA6E8" stroke="#fff" stroke-width="14"/>
      <path d="M1090,690 L1090,610 M1130,690 L1130,610" stroke="#B0BEC5" stroke-width="8" stroke-linecap="round"/>
      <g><rect x="160" y="640" width="30" height="60" fill="#B0BEC5"/><rect x="150" y="620" width="260" height="22" rx="10" ${ln('#48DBFB', 3)}/></g>
      <g><path d="M1260,740 L1520,740 M1290,740 L1280,790 M1490,740 L1500,790" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M1260,720 L1450,720 Q1520,700 1540,650" stroke="#FF8FB1" stroke-width="34" fill="none" stroke-linecap="round"/></g>
      ${P('umbrella', 1600, 760, 0.8, `<rect x="-5" y="-300" width="10" height="300" fill="#eee" stroke="#ccc"/><path d="M-180,-280 Q0,-420 180,-280Z" ${ln('#1DD1A1', 2)}/><path d="M-180,-280 Q-118,-380 -60,-330 L-60,-280Z M60,-280 L60,-330 Q118,-380 180,-280Z" fill="#fff"/>`)}
      ${P('floaty', 90, 720, 1, `<rect x="-6" y="-200" width="12" height="200" fill="#999"/><circle cy="-170" r="46" fill="none" stroke="#FF6B8B" stroke-width="22"/><circle cy="-170" r="46" fill="none" stroke="#fff" stroke-width="22" stroke-dasharray="24 48"/><circle cy="-70" r="40" fill="none" stroke="#FECA57" stroke-width="20"/>`)}`,
    fronts: [{ z: 880, svg: `<rect x="307" y="700" width="806" height="163" rx="20" fill="#3FB6F0" opacity=".78"/>${[730, 780, 830].map((y, i) => `<path d="M${340 + i * 40},${y} q30,-10 60,0 t60,0 M${700 - i * 30},${y + 14} q30,-10 60,0 t60,0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`).join('')}` }],
    seats: [{ x: 480, y: 800, kind: 'sit', scale: 1, z: 870 }, { x: 710, y: 800, kind: 'sit', scale: 1, z: 870 }, { x: 940, y: 800, kind: 'sit', scale: 1, z: 870 }, { x: 1380, y: 690, kind: 'lie', scale: 0.88, z: 745 }],
    surfaces: [],
    items: [['🏐', 1250, 840], ['🛟', 200, 840]],
  },
  /* ------------------------------ STREET ------------------------------ */
  street: {
    key: 'street', name: 'רחוב הבתים', icon: '🏘️', w: 2100, color: '#FFF0D6',
    draw: (w) => skyG(w, 'S') + `
      ${houseFacade(70, 300, 330, '#FFB3C7', '#C93A3A', '#8B5A2B')}
      ${houseFacade(460, 280, 300, '#FFE08A', '#3E5FD9', '#E84E4E')}
      <g><rect x="820" y="${FT - 500}" width="280" height="500" ${ln('#B5E3FF', 3)}/>${[0, 1, 2, 3, 4].map(r => [0, 1, 2].map(c => `<rect x="${846 + c * 82}" y="${FT - 470 + r * 86}" width="58" height="58" rx="6" fill="${(r + c) % 3 ? '#fff' : '#FFF3A0'}" stroke="#7BB6DA" stroke-width="3"/>`).join('')).join('')}<rect x="925" y="${FT - 60}" width="70" height="60" fill="#7BB6DA"/></g>
      ${houseFacade(1180, 300, 320, '#BDF0C8', '#1DA27A', '#5F7FFF')}
      <g><rect x="1560" y="${FT - 300}" width="460" height="300" ${ln('#FFF3E0', 3)}/><path d="M1540,${FT - 300} L2040,${FT - 300} L2020,${FT - 240} L1560,${FT - 240}Z" fill="#FF6B8B"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${1560 + i * 80},${FT - 300} l40,0 l-4,60 l-40,0Z" fill="#fff" opacity=".8"/>`).join('')}<rect x="1600" y="${FT - 210}" width="180" height="150" rx="10" fill="#9AD8FF"/><text x="1690" y="${FT - 110}" font-size="70" text-anchor="middle">🧁</text><rect x="1840" y="${FT - 180}" width="120" height="180" rx="10" fill="#8B5A2B"/><text x="1790" y="${FT - 252}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">קונדיטוריה</text></g>
      <rect y="${FT}" width="${w}" height="240" fill="#DCDCE6"/>${Array.from({ length: Math.ceil(w / 120) }, (_, i) => `<path d="M${i * 120},${FT} L${i * 120 - 40},850" stroke="#C6C6D4" stroke-width="4"/>`).join('')}<path d="M0,690 L${w},690 M0,770 L${w},770" stroke="#C6C6D4" stroke-width="4"/>
      <rect y="844" width="${w}" height="12" fill="#B0B0C0"/><rect y="856" width="${w}" height="44" fill="#5B5F70"/>${Array.from({ length: Math.ceil(w / 160) }, (_, i) => `<rect x="${i * 160 + 30}" y="874" width="80" height="8" rx="4" fill="#fff"/>`).join('')}
      ${lampPost(400)}${lampPost(1130)}${lampPost(1520)}
      ${P('mailbox', 770, 760, 1, `<rect x="-6" y="-100" width="12" height="100" fill="#555"/><path d="M-50,-100 L50,-100 L50,-170 Q50,-200 0,-200 Q-50,-200 -50,-170Z" ${ln('#3E5FD9', 3)}/><rect x="-30" y="-160" width="60" height="10" rx="5" fill="#2a47b8"/><rect x="50" y="-190" width="8" height="50" fill="#E84E4E"/><path d="M58,-190 L82,-182 L58,-174Z" fill="#E84E4E"/>`)}
      <g><rect x="1240" y="470" width="14" height="230" fill="#3A4256"/><rect x="1440" y="470" width="14" height="230" fill="#3A4256"/><rect x="1225" y="450" width="245" height="28" rx="10" ${ln('#5F7FFF', 3)}/><rect x="1260" y="482" width="176" height="110" rx="8" fill="#BEE6FF" opacity=".5"/><rect x="1250" y="636" width="200" height="16" rx="6" ${ln('#B8753A', 2)}/><text x="1347" y="468" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">🚌 תחנה</text></g>
      ${P('car', 600, 896, 1, `<path d="M-150,-40 L-150,-90 Q-140,-110 -100,-112 L-60,-160 L70,-160 L110,-112 Q150,-110 160,-80 L160,-40Z" ${ln('#FF6B8B', 3)}/><path d="M-50,-150 L-50,-114 L10,-114 L10,-150Z M24,-150 L24,-114 L96,-114 L66,-150Z" fill="#BEE6FF"/><circle cx="-90" cy="-36" r="30" ${ln('#333', 3)}/><circle cx="100" cy="-36" r="30" ${ln('#333', 3)}/><circle cx="-90" cy="-36" r="12" fill="#ccc"/><circle cx="100" cy="-36" r="12" fill="#ccc"/><circle cx="150" cy="-86" r="9" fill="#FFF3A0"/>`)}
      ${[[250, 0.9], [1040, 0.8], [1990, 0.85]].map(([x, s]) => P('plant', x, 700, s, `<rect x="-40" y="-70" width="80" height="70" rx="10" ${ln('#E86F4E', 3)}/><circle cy="-120" r="62" ${ln('#58BC5C', 3)}/><circle cx="-30" cy="-140" r="24" fill="#7AD07C" opacity=".7"/>`)).join('')}`,
    seats: [{ x: 1300, y: 640, kind: 'sit', scale: 0.9, z: 700 }, { x: 1400, y: 640, kind: 'sit', scale: 0.9, z: 700 }],
    surfaces: [],
    items: [['🛴', 1000, 820], ['🐶', 1700, 800]],
  },
  /* ------------------------------ CAFÉ ------------------------------ */
  cafe: {
    key: 'cafe', name: 'קונדיטוריה', icon: '🧁', w: 1550, color: '#FFE4EC',
    draw: (w) => room(w, { wall: '#FFE4EC', wall2: '#FFD0DE', pattern: 'stripes', floor: '#F7E8D6', floor2: '#E8CFAF', floorKind: 'checker' }) + `
      <g><rect x="200" y="90" width="300" height="190" rx="14" fill="#3A4256" stroke="#B8753A" stroke-width="12"/><text x="350" y="150" font-size="34" fill="#fff" text-anchor="middle" font-weight="700">תפריט</text><text x="350" y="230" font-size="50" text-anchor="middle">☕ 🧁 🍰</text></g>
      ${[900, 1300].map(x => `<path d="M${x},0 L${x},140" stroke="#555" stroke-width="4"/><path d="M${x - 50},190 Q${x},120 ${x + 50},190Z" ${ln('#1DD1A1', 3)}/><circle cx="${x}" cy="194" r="12" fill="#FFF3A0"/>`).join('')}
      ${P('cafe', 380, 690, 1, `<rect x="-280" y="-210" width="560" height="210" rx="14" ${ln('#9BE7D5', 3)}/>${[-200, -60, 80, 210].map(x => `<rect x="${x - 50}" y="-160" width="100" height="120" rx="10" fill="#7FD9C4"/>`).join('')}<rect x="-300" y="-228" width="600" height="26" rx="10" ${ln('#fff', 3)}/><rect x="-260" y="-330" width="360" height="104" rx="14" fill="#E6FAFF" opacity=".8" stroke="#B0E0EE" stroke-width="4"/><text x="-200" y="-252" font-size="54">🧁</text><text x="-120" y="-252" font-size="54">🍰</text><text x="-40" y="-252" font-size="54">🍩</text><rect x="160" y="-330" width="100" height="104" rx="12" ${ln('#555', 3)}/><rect x="185" y="-280" width="50" height="10" fill="#333"/><rect x="195" y="-262" width="30" height="34" rx="6" fill="#fff"/>`)}
      ${[1000, 1330].map(x => `${chairBack(x - 110, '#FF8FB1')}${chairBack(x + 110, '#FF8FB1')}<ellipse cx="${x}" cy="600" rx="110" ry="22" ${ln('#fff', 3)}/><rect x="${x - 8}" y="610" width="16" height="100" fill="#999"/><ellipse cx="${x}" cy="712" rx="50" ry="10" fill="#999"/>`).join('')}`,
    seats: [{ x: 890, y: 650, kind: 'sit', scale: 0.9, z: 700 }, { x: 1110, y: 650, kind: 'sit', scale: 0.9, z: 700 }, { x: 1220, y: 650, kind: 'sit', scale: 0.9, z: 700 }, { x: 1440, y: 650, kind: 'sit', scale: 0.9, z: 700 }],
    surfaces: [{ x1: 900, x2: 1100, y: 598, scale: 0.82 }, { x1: 1230, x2: 1430, y: 598, scale: 0.82 }, { x1: 110, x2: 650, y: 464, scale: 0.72 }],
    items: [['☕', 980, 598], ['🧁', 1330, 598], ['🥐', 560, 464]],
  },
  /* ------------------------------ BOUTIQUE ------------------------------ */
  boutique: {
    key: 'boutique', name: 'חנות בגדים', icon: '👗', w: 1550, color: '#F3E5FF',
    draw: (w) => room(w, { wall: '#F3E5FF', wall2: '#ffffff', pattern: 'dots', floor: '#E8D3BC', floor2: '#D6BC9E' }) + `
      <g><rect x="560" y="70" width="430" height="110" rx="55" fill="#fff" stroke="#E0B8FF" stroke-width="8"/><text x="775" y="146" font-size="52" font-weight="700" fill="#A55EEA" text-anchor="middle">👗 בוטיק</text></g>
      ${P('rack', 300, 680, 1, `<path d="M-200,0 L-200,-380 L200,-380 L200,0" stroke="#B0BEC5" stroke-width="12" fill="none"/><rect x="-220" y="-10" width="440" height="14" rx="6" fill="#B0BEC5"/>${['#FF6B8B', '#FECA57', '#48DBFB', '#A55EEA', '#1DD1A1', '#FF9F43'].map((c, i) => `<g transform="translate(${-160 + i * 64} -380)"><path d="M0,0 L0,14 M-22,24 L0,14 L22,24" stroke="#888" stroke-width="3" fill="none"/><path d="M-22,24 L22,24 L34,150 Q0,160 -34,150Z" ${ln(c, 2)}/></g>`).join('')}`)}
      <g transform="translate(700 690)"><rect x="-6" y="-60" width="12" height="60" fill="#888"/><ellipse cy="0" rx="50" ry="10" fill="#888"/><ellipse cy="-300" rx="40" ry="44" fill="#F2E6D8"/><path d="M-50,-250 L50,-250 L80,-60 Q0,-46 -80,-60Z" ${ln('#FF8FB1', 3)}/><path d="M-50,-250 L50,-250 L44,-200 L-44,-200Z" fill="#fff"/></g>
      ${P('mirror', 950, 700, 1, `<path d="M-60,0 L-40,-40 M60,0 L40,-40" stroke="#C9874B" stroke-width="10"/><ellipse cy="-230" rx="100" ry="190" ${ln('#E0B060', 5)}/><ellipse cy="-230" rx="84" ry="174" fill="#D8F1FF"/><path d="M-40,-320 L10,-370 M-30,-260 L40,-330" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".8"/><text y="-200" font-size="60" text-anchor="middle" opacity=".85">💇</text>`)}
      <g><rect x="1060" y="250" width="200" height="14" rx="6" fill="#B8753A"/><text x="1160" y="244" font-size="54" text-anchor="middle">👟👠</text><rect x="1060" y="360" width="200" height="14" rx="6" fill="#B8753A"/><text x="1160" y="354" font-size="54" text-anchor="middle">👒🎀</text></g>
      ${P('booth', 1400, 690, 1, `<rect x="-120" y="-460" width="240" height="460" fill="#fff" opacity=".4"/><rect x="-130" y="-470" width="260" height="18" rx="8" fill="#B8753A"/><path d="M-120,-452 Q-100,-230 -120,0 L-10,0 Q10,-230 -10,-452Z" ${ln('#A55EEA', 3)}/><path d="M120,-452 Q100,-230 120,0 L10,0 Q-10,-230 10,-452Z" ${ln('#A55EEA', 3)}/><text y="-480" font-size="40" text-anchor="middle">✨</text>`)}
      <g><ellipse cx="560" cy="700" rx="70" ry="20" fill="#C96A86"/><rect x="490" y="640" width="140" height="62" rx="30" ${ln('#FF8FB1', 3)}/><ellipse cx="560" cy="642" rx="70" ry="20" fill="#FFB3C7"/></g>`,
    seats: [{ x: 560, y: 646, kind: 'sit', scale: 0.92, z: 710 }],
    surfaces: [],
    items: [['👜', 1180, 820], ['👒', 760, 840], ['🕶️', 300, 820]],
  },
  /* ------------------------------ SCHOOL ------------------------------ */
  school: {
    key: 'school', name: 'בית ספר', icon: '🏫', w: 1700, color: '#E3F6DA',
    draw: (w) => room(w, { wall: '#E8F6E1', wall2: '#D6EECC', pattern: 'stripes', floor: '#D8A46A', floor2: '#C48E55' }) + `
      ${'אבגדהוזחטיכ'.split('').map((ch, i) => `<circle cx="${w - 120 - i * 130}" cy="50" r="32" fill="${['#FF6B8B', '#FECA57', '#48DBFB', '#1DD1A1', '#A55EEA', '#FF9F43'][i % 6]}"/><text x="${w - 120 - i * 130}" y="64" font-size="38" font-weight="700" fill="#fff" text-anchor="middle">${ch}</text>`).join('')}
      ${P('board', 760, 420, 1, `<rect x="-320" y="-300" width="640" height="300" rx="10" fill="#2F5D46" stroke="#B8753A" stroke-width="16"/><rect x="-300" y="2" width="600" height="14" fill="#B8753A"/><text class="chalk" y="-120" font-size="78" fill="#fff" text-anchor="middle" font-weight="700">א ב ג</text><rect x="200" y="-6" width="40" height="10" rx="3" fill="#fff"/>`)}
      ${[420, 760, 1100].map(x => chairBack(x, '#5F7FFF')).join('')}
      ${P('books', 150, 690, 1, `<rect x="-110" y="-330" width="220" height="330" rx="10" ${ln('#C9874B', 3)}/>${[-240, -150, -60].map(y => `<rect x="-100" y="${y}" width="200" height="10" fill="#A86A36"/>`).join('')}${[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(i => `<rect x="${-94 + i * 38}" y="${-310 + r * 90}" width="30" height="${66 + (i % 2) * 8}" rx="3" fill="${['#FF6B8B', '#48DBFB', '#FECA57', '#1DD1A1', '#A55EEA'][(i + r) % 5]}"/>`).join('')).join('')}`)}
      <g><rect x="1330" y="560" width="300" height="22" rx="8" ${ln('#C9874B', 3)}/><rect x="1350" y="582" width="260" height="110" fill="#B8753A"/></g>
      ${P('globe', 1560, 560, 1, `<rect x="-30" y="-8" width="60" height="10" rx="4" fill="#555"/><rect x="-4" y="-40" width="8" height="34" fill="#555"/><circle cy="-90" r="50" ${ln('#48DBFB', 3)}/><path d="M-30,-120 q20,10 10,30 q-14,10 -6,30 M10,-130 q24,6 20,30 q-10,16 14,26" stroke="#58BC5C" stroke-width="12" fill="none" stroke-linecap="round"/>`)}
      <g transform="translate(1480 160)"><circle r="54" fill="#fff" stroke="#E84E4E" stroke-width="8"/><path d="M0,0 L0,-34 M0,0 L24,10" stroke="#333" stroke-width="6" stroke-linecap="round"/></g>`,
    fronts: [{ z: 730, svg: [420, 760, 1100].map(x => `<rect x="${x - 110}" y="594" width="220" height="20" rx="8" ${ln('#FECA57', 3)}/><rect x="${x - 100}" y="614" width="200" height="72" rx="6" ${ln('#F2B25C', 3)}/><rect x="${x - 96}" y="686" width="12" height="40" fill="#999"/><rect x="${x + 84}" y="686" width="12" height="40" fill="#999"/>`).join('') }],
    seats: [{ x: 420, y: 652, kind: 'sit', scale: 0.9, z: 700 }, { x: 760, y: 652, kind: 'sit', scale: 0.9, z: 700 }, { x: 1100, y: 652, kind: 'sit', scale: 0.9, z: 700 }],
    surfaces: [{ x1: 320, x2: 520, y: 596, scale: 0.8 }, { x1: 660, x2: 860, y: 596, scale: 0.8 }, { x1: 1000, x2: 1200, y: 596, scale: 0.8 }, { x1: 1340, x2: 1510, y: 562, scale: 0.78 }],
    items: [['✏️', 470, 596], ['📏', 810, 596], ['🍎', 1400, 562]],
  },
  /* ------------------------------ CLINIC ------------------------------ */
  clinic: {
    key: 'clinic', name: 'מרפאה', icon: '🩺', w: 1550, color: '#E2FAF3',
    draw: (w) => room(w, { wall: '#E9FBF6', wall2: '#D2F3EA', pattern: 'tiles', floor: '#EAF2F5', floor2: '#D3E2EA', floorKind: 'checker', base: '#fff' }) + `
      <g><rect x="160" y="120" width="200" height="240" rx="16" fill="#fff" stroke="#9BE7D5" stroke-width="8"/><text x="260" y="250" font-size="110" text-anchor="middle">❤️</text><text x="260" y="330" font-size="28" font-weight="700" fill="#2FA387" text-anchor="middle">בריאות!</text></g>
      <g><rect x="760" y="90" width="70" height="420" rx="10" fill="#fff" stroke="#ddd" stroke-width="4"/>${Array.from({ length: 7 }, (_, i) => `<rect x="766" y="${96 + i * 58}" width="58" height="52" fill="${['#FF6B8B', '#FF9F43', '#FECA57', '#1DD1A1', '#48DBFB', '#5F7FFF', '#A55EEA'][i]}" opacity=".7"/>`).join('')}</g>
      <g><rect x="230" y="560" width="480" height="40" rx="14" ${ln('#9BE7D5', 3)}/><rect x="240" y="540" width="460" height="26" rx="10" fill="#fff" stroke="#ddd" stroke-width="3"/><rect x="250" y="510" width="120" height="44" rx="20" ${ln('#fff', 3)}/><rect x="260" y="600" width="16" height="100" fill="#B0BEC5"/><rect x="664" y="600" width="16" height="100" fill="#B0BEC5"/></g>
      <g><rect x="920" y="560" width="300" height="22" rx="8" ${ln('#fff', 3)}/><rect x="940" y="582" width="16" height="110" fill="#B0BEC5"/><rect x="1184" y="582" width="16" height="110" fill="#B0BEC5"/><rect x="1060" y="440" width="140" height="100" rx="10" fill="#3A4256"/><rect x="1068" y="448" width="124" height="80" rx="6" fill="#9BE7D5"/><path d="M1080,490 l20,0 10,-24 14,46 12,-22 30,0" stroke="#E84E4E" stroke-width="5" fill="none"/><rect x="1120" y="540" width="20" height="22" fill="#3A4256"/></g>
      ${P('medkit', 1380, 360, 1, `<rect x="-110" y="-200" width="220" height="200" rx="18" ${ln('#fff', 4)}/><rect x="-110" y="-200" width="220" height="40" rx="18" fill="#9BE7D5"/><path d="M0,-50 Q-50,-86 -36,-112 Q-22,-134 0,-112 Q22,-134 36,-112 Q50,-86 0,-50Z" fill="#FF5C8A"/>`)}
      ${[1330, 1450].map(x => chairBack(x, '#1DD1A1')).join('')}`,
    seats: [{ x: 470, y: 546, kind: 'lie', scale: 0.84, z: 640 }, { x: 1330, y: 650, kind: 'sit', scale: 0.9, z: 700 }, { x: 1450, y: 650, kind: 'sit', scale: 0.9, z: 700 }],
    surfaces: [{ x1: 930, x2: 1050, y: 562, scale: 0.78 }],
    items: [['🩺', 980, 562], ['🧸', 1150, 820]],
  },
  /* ------------------------------ SECOND HOUSE: KIDS' ROOM ------------------------------ */
  kids: {
    key: 'kids', name: 'חדר ילדים', icon: '🧸', w: 1700, color: '#DFF3FF',
    draw: (w) => room(w, { wall: '#DFF3FF', wall2: '#ffffff', pattern: 'dots', floor: '#E9C9A0', floor2: '#D6B282' }) + `
      <ellipse cx="900" cy="790" rx="300" ry="70" fill="#FECA57" opacity=".6"/><ellipse cx="900" cy="790" rx="230" ry="50" fill="#FF9F43" opacity=".5"/>
      <g><rect x="130" y="200" width="30" height="500" rx="10" ${ln('#5F7FFF', 3)}/><rect x="580" y="200" width="30" height="500" rx="10" ${ln('#5F7FFF', 3)}/><rect x="150" y="416" width="440" height="30" rx="10" fill="#fff" stroke="#ddd" stroke-width="3"/><rect x="150" y="606" width="440" height="30" rx="10" fill="#fff" stroke="#ddd" stroke-width="3"/><rect x="170" y="380" width="110" height="46" rx="20" fill="#FFF3F8" stroke="#ddd" stroke-width="3"/><rect x="170" y="570" width="110" height="46" rx="20" fill="#FFF3F8" stroke="#ddd" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M610,${260 + i * 70} L660,${260 + i * 70}" stroke="#5F7FFF" stroke-width="8"/>`).join('')}<path d="M660,220 L660,700" stroke="#5F7FFF" stroke-width="10"/></g>
      ${P('window', 1100, 360, 1, windowInner)}
      ${P('tent', 1000, 720, 1, `<path d="M-150,0 L0,-300 L150,0Z" ${ln('#FF8FB1', 3)}/><path d="M-100,0 L0,-300 L-50,0Z M50,0 L0,-300 L100,0Z" fill="#fff" opacity=".5"/><path d="M-40,0 L0,-120 L40,0Z" fill="#7a3a5a"/><path d="M0,-300 L-20,-340 M0,-300 L20,-344" stroke="#B8753A" stroke-width="8" stroke-linecap="round"/><path d="M20,-344 L54,-330 L22,-318Z" fill="#FECA57"/>`)}
      <g><rect x="1350" y="250" width="280" height="16" rx="6" fill="#B8753A"/><text x="1490" y="244" font-size="60" text-anchor="middle">🦄🐻🚀</text></g>
      ${P('toybox', 1450, 730, 1, `<rect x="-100" y="-120" width="200" height="120" rx="12" ${ln('#1DD1A1', 3)}/><rect x="-110" y="-136" width="220" height="30" rx="10" ${ln('#17B38A', 3)}/><circle cx="-40" cy="-60" r="18" fill="#FECA57"/><path d="M20,-80 l12,24 26,4 -19,18 5,26 -24,-13 -24,13 5,-26 -19,-18 26,-4Z" fill="#fff" transform="translate(10 6) scale(.8)"/>`)}`,
    fronts: [
      { z: 470, svg: `<path d="M300,418 Q440,404 590,414 L590,450 L300,450Z" ${ln('#FF6B8B', 3)}/><rect x="150" y="440" width="440" height="26" rx="8" ${ln('#5F7FFF', 3)}/>` },
      { z: 705, svg: `<path d="M300,608 Q440,594 590,604 L590,640 L300,640Z" ${ln('#1DD1A1', 3)}/><rect x="150" y="630" width="440" height="40" rx="10" ${ln('#5F7FFF', 3)}/>` },
    ],
    seats: [{ x: 330, y: 410, kind: 'lie', scale: 0.78, z: 460, bed: true }, { x: 330, y: 600, kind: 'lie', scale: 0.8, z: 700, bed: true }],
    surfaces: [],
    items: [['🦖', 780, 830], ['🪀', 1250, 810], ['🐰', 1100, 840], ['🚀', 900, 760]],
  },
  /* ------------------------------ CASTLE ------------------------------ */
  castle: {
    key: 'castle', name: 'ארמון', icon: '🏰', w: 1900, color: '#EDE7FF',
    draw: (w) => {
      let bricks = '';
      for (let y = 40, r = 0; y < FT; y += 60, r++) { bricks += `<path d="M0,${y} L${w},${y}" stroke="#A39CC6" stroke-width="3"/>`; for (let x = (r % 2) * 60; x < w; x += 120) bricks += `<path d="M${x},${y - 60} L${x},${y}" stroke="#A39CC6" stroke-width="3"/>`; }
      return room(w, { wall: '#B9B3D6', wall2: '#B9B3D6', floor: '#D8D2EE', floor2: '#C2BAE2', floorKind: 'checker' }) + bricks + `
      ${[300, 1600].map(x => `<path d="M${x - 110},460 L${x - 110},200 Q${x},60 ${x + 110},200 L${x + 110},460Z" fill="#fff"/><path d="M${x - 96},450 L${x - 96},206 Q${x},80 ${x + 96},206 L${x + 96},450Z" fill="#9AD8FF"/><path d="M${x},90 L${x},450 M${x - 96},300 L${x + 96},300" stroke="#fff" stroke-width="8"/><circle cx="${x}" cy="200" r="30" fill="#FF8FB1" opacity=".7"/>`).join('')}
      ${[620, 1280].map((x, i) => `<path d="M${x - 70},40 L${x + 70},40 L${x + 70},360 L${x},320 L${x - 70},360Z" fill="${i ? '#5F7FFF' : '#FF6B8B'}"/><text x="${x}" y="200" font-size="80" text-anchor="middle">👑</text><rect x="${x - 86}" y="30" width="172" height="16" rx="8" fill="#E0A400"/>`).join('')}
      <path d="M860,${FT} L1040,${FT} L1180,900 L720,900Z" fill="#D9443A"/><path d="M860,${FT} L720,900 M1040,${FT} L1180,900" stroke="#FFC93C" stroke-width="10"/>
      <g><path d="M830,640 L830,280 Q950,200 1070,280 L1070,640Z" ${ln('#FFC93C', 4)}/><path d="M860,600 L860,300 Q950,240 1040,300 L1040,600Z" fill="#D9443A"/><text x="950" y="330" font-size="60" text-anchor="middle">👑</text><rect x="840" y="590" width="220" height="60" rx="16" ${ln('#D9443A', 3)}/><rect x="820" y="640" width="260" height="50" rx="10" ${ln('#FFC93C', 4)}/></g>
      ${P('chandelier', 950, 200, 1, `<path d="M0,-200 L0,-60" stroke="#E0A400" stroke-width="6"/><path d="M-120,-40 Q0,40 120,-40" stroke="#FFC93C" stroke-width="12" fill="none"/>${[-120, -60, 0, 60, 120].map(x => `<rect x="${x - 6}" y="${-80 + Math.abs(x) / 3}" width="12" height="40" fill="#fff"/><path d="M${x},${-96 + Math.abs(x) / 3} q-10,-14 0,-26 q10,12 0,26" fill="#FF9F43"/>`).join('')}`)}
      <g transform="translate(150 700)"><rect x="-30" y="-20" width="60" height="20" fill="#888"/><rect x="-44" y="-220" width="88" height="200" rx="20" ${ln('#C9D1D9', 3)}/><circle cy="-260" r="46" ${ln('#C9D1D9', 3)}/><rect x="-30" y="-268" width="60" height="10" fill="#555"/><path d="M0,-306 q30,-40 10,-70" stroke="#E84E4E" stroke-width="12" fill="none" stroke-linecap="round"/></g>
      ${P('fire', 1750, 690, 1, `<rect x="-140" y="-260" width="280" height="260" rx="12" ${ln('#8E86B8', 3)}/><rect x="-160" y="-280" width="320" height="30" rx="10" fill="#7D74A8"/><path d="M-90,0 L-90,-170 Q0,-230 90,-170 L90,0Z" fill="#3A2F4A"/><g class="flames"><path d="M-60,-10 Q-70,-80 -30,-120 Q-30,-70 0,-60 Q0,-140 40,-170 Q30,-90 60,-60 Q70,-30 60,-10Z" fill="#FF9F43"/><path d="M-30,-10 Q-30,-60 0,-80 Q10,-40 30,-30 Q34,-14 30,-10Z" fill="#FECA57"/></g>`)}
      ${P('chest', 1350, 760, 1, `<rect x="-90" y="-90" width="180" height="90" rx="10" ${ln('#B8753A', 3)}/><path d="M-90,-90 Q-90,-150 0,-150 Q90,-150 90,-90Z" ${ln('#C9874B', 3)}/><rect x="-96" y="-96" width="192" height="12" fill="#FFC93C"/><rect x="-14" y="-110" width="28" height="36" rx="6" fill="#FFC93C"/><circle cy="-92" r="5" fill="#6b4a1a"/>`)}`;
    },
    seats: [{ x: 950, y: 600, kind: 'sit', scale: 0.95, z: 690 }],
    surfaces: [],
    items: [['🦄', 520, 820], ['👑', 1150, 860], ['🌹', 1500, 840]],
  },
};
Object.assign(SPAWN, {
  barn: ['🐷', '🐔', '🐑', '🐰', '🐴', '🐮', '🐣'],
  hen: ['🥚', '🥚', '🐣'],
  floaty: ['🛟', '🏐', '🦆', '🍉', '🧃'],
  mailbox: ['✉️', '📦', '💌', '🎁'],
  cafe: ['🧁', '🍰', '🥐', '🍩', '☕', '🍪', '🥧', '🍮'],
  books: ['📚', '✏️', '🖍️', '📏', '🎨', '📒'],
  medkit: ['🩹', '🌡️', '🍭', '🧸', '🩹'],
  chest: ['👑', '💎', '🪄', '💍', '🏆', '🎀', '⭐'],
});

/* ---------------- final world order (left → right) ---------------- */
(function () {
  const all = {};
  for (const z of ZONES) all[z.key] = z;
  Object.assign(all, MORE);
  const order = ['farm', 'beach', 'pool', 'park', 'street', 'cafe', 'boutique', 'school', 'clinic', 'kitchen', 'living', 'bath', 'bedroom', 'kids', 'castle'];
  ZONES.splice(0, ZONES.length, ...order.map(k => all[k]));
})();
let _x = 0;
for (const z of ZONES) { z.x0 = _x; _x += z.w; }
const WORLD_W = _x;
const SEATS = [], SURFACES = [];
ZONES.forEach(z => {
  (z.seats || []).forEach((s, i) => SEATS.push(Object.assign({}, s, { id: z.key + i, x: s.x + z.x0 })));
  (z.surfaces || []).forEach(s => SURFACES.push({ x1: s.x1 + z.x0, x2: s.x2 + z.x0, y: s.y, scale: s.scale }));
});
const seatById = (id) => SEATS.find(s => s.id === id);
