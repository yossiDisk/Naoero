'use strict';
/* =========================================================
   The world: one long strip of places, left to right.
   Every zone is drawn in its own local coordinates (w × 900).
   FT = where the wall/sky meets the floor.
   seats:    {x,y,kind:'sit'|'lie'|'bath'|'swing',scale,z,bar?}
   surfaces: {x1,x2,y,scale}  (items can rest on them)
   fronts:   svg drawn in FRONT of characters (tub side, blanket…), with z
   items:    starting items [emoji,x,y]
   ========================================================= */
const FT = 610;

const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="62" ry="30"/><circle cx="-32" cy="-10" r="30"/><circle cx="18" cy="-24" r="40"/><circle cx="52" cy="-4" r="26"/></g>`;
const P = (name, x, y, s, inner) => `<g transform="translate(${Math.round(x)} ${y}) scale(${s})"><g class="prop" data-prop="${name}">${inner}</g></g>`;
const sunInner = (r = 62) => `<g class="rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-7" y="${-r - 40}" width="14" height="30" rx="7" fill="#FFC21A" transform="rotate(${i * 30})"/>`).join('')}</g>` +
  `<circle r="${r}" fill="#FFD43B" stroke="#F5B400" stroke-width="4"/><circle cx="-20" cy="-8" r="6" fill="#6b4a1a"/><circle cx="20" cy="-8" r="6" fill="#6b4a1a"/><path d="M-22,14 Q0,34 22,14" stroke="#6b4a1a" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="-36" cy="12" r="9" fill="#FF9F6B" opacity=".6"/><circle cx="36" cy="12" r="9" fill="#FF9F6B" opacity=".6"/>`;
const flowerInner = (c) => `<path d="M0,0 Q-4,-30 0,-60" stroke="#3E9A43" stroke-width="6" fill="none"/><ellipse cx="-12" cy="-26" rx="11" ry="5" fill="#4CAF50" transform="rotate(-30 -12 -26)"/>` +
  [0, 60, 120, 180, 240, 300].map(a => `<circle cx="${(14 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(-62 + 14 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="11" ${ln(c, 1.5)}/>`).join('') + `<circle cx="0" cy="-62" r="9" fill="#FFD43B"/>`;
const treeInner = `<rect x="-22" y="-220" width="44" height="224" rx="12" ${ln('#8B5A2B', 2)}/><path d="M-6,-120 L-40,-170 M8,-150 L36,-190" stroke="#8B5A2B" stroke-width="12" stroke-linecap="round"/>` +
  `<circle cx="-75" cy="-240" r="75" ${ln('#47A84E', 3)}/><circle cx="75" cy="-245" r="75" ${ln('#47A84E', 3)}/><circle cx="0" cy="-315" r="95" ${ln('#58BC5C', 3)}/><circle cx="-10" cy="-220" r="78" fill="#58BC5C"/>` +
  `<circle cx="-30" cy="-340" r="22" fill="#7AD07C" opacity=".6"/>` +
  [[-50, -270], [40, -310], [75, -225], [-20, -200], [-90, -220]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" ${ln('#F0453B', 1.5)}/>`).join('');

// common indoor room: wall + floor + baseboard + door frame on the left edge
function room(w, o) {
  let s = `<rect width="${w}" height="${FT}" fill="${o.wall}"/>`;
  if (o.pattern === 'stripes') for (let x = 0; x < w; x += 90) s += `<rect x="${x}" width="44" height="${FT}" fill="${o.wall2}" opacity=".6"/>`;
  if (o.pattern === 'dots') for (let y = 50, r = 0; y < FT - 40; y += 110, r++) for (let x = 30 + (r % 2) * 60; x < w; x += 120) s += `<circle cx="${x}" cy="${y}" r="9" fill="${o.wall2}" opacity=".8"/>`;
  if (o.pattern === 'tiles') { for (let x = 0; x < w; x += 60) s += `<path d="M${x},0 L${x},${FT}" stroke="${o.wall2}" stroke-width="3"/>`; for (let y = 0; y < FT; y += 60) s += `<path d="M0,${y} L${w},${y}" stroke="${o.wall2}" stroke-width="3"/>`; }
  s += `<rect y="${FT}" width="${w}" height="${900 - FT}" fill="${o.floor}"/>`;
  if (o.floorKind === 'checker') {
    for (let y = FT, r = 0; y < 900; y += 70 + r * 10, r++) for (let x = (r % 2) * 80; x < w; x += 160) s += `<rect x="${x}" y="${y}" width="80" height="${70 + r * 10}" fill="${o.floor2}"/>`;
  } else {
    [FT + 40, FT + 100, FT + 175, FT + 265].forEach(y => s += `<path d="M0,${y} L${w},${y}" stroke="${o.floor2}" stroke-width="4"/>`);
  }
  s += `<rect y="${FT - 20}" width="${w}" height="22" fill="${o.base || '#FFF7EC'}"/><rect y="${FT}" width="${w}" height="10" fill="#000" opacity=".06"/>`;
  // door frame / wall edge between rooms
  s += `<rect x="0" y="0" width="46" height="${FT + 30}" fill="${shade(o.wall, -0.18)}"/><rect x="46" y="0" width="10" height="${FT + 26}" fill="${shade(o.wall, -0.28)}"/>`;
  return s;
}

const ZONES = [
  /* ------------------------------ BEACH ------------------------------ */
  {
    key: 'beach', name: 'ים', icon: '🏖️', w: 1800, color: '#BDE6FF',
    draw: (w) => `<defs><linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6CC4FF"/><stop offset="1" stop-color="#D4F0FF"/></linearGradient></defs>
      <rect width="${w}" height="900" fill="url(#skyB)"/>
      ${P('sun', 260, 150, 1, sunInner(58))}
      <g class="drift" style="--w:${w + 500}px;animation-duration:90s">${cloud(-200, 120, 1)}${cloud(-900, 200, 0.7)}</g>
      <path d="M1200,370 Q1320,300 1440,370Z" fill="#7CC4A0"/>
      <rect y="360" width="${w}" height="260" fill="#2E9BE0"/><rect y="360" width="${w}" height="26" fill="#5BB8F0"/>
      <g class="wave"><path d="M-100,440 ${Array.from({ length: Math.ceil(w / 120) + 3 }, () => 'q30,-14 60,0 t60,0').join(' ')}" stroke="#8ED3FA" stroke-width="6" fill="none"/></g>
      <g class="wave" style="animation-delay:-1.5s"><path d="M-60,520 ${Array.from({ length: Math.ceil(w / 120) + 3 }, () => 'q30,-14 60,0 t60,0').join(' ')}" stroke="#8ED3FA" stroke-width="6" fill="none"/></g>
      <g class="drift" style="--w:${w + 400}px;animation-duration:55s"><g transform="translate(-200 430)"><path d="M-70,0 L70,0 L50,30 L-50,30Z" fill="#E84E4E"/><rect x="-3" y="-110" width="6" height="110" fill="#6b4a1a"/><path d="M3,-105 L3,-10 L65,-10Z" fill="#fff"/></g></g>
      <path d="M0,612 Q${w * 0.25},580 ${w * 0.5},605 T${w},595 L${w},900 L0,900Z" fill="#F6D7A7"/>
      <path d="M0,612 Q${w * 0.25},580 ${w * 0.5},605 T${w},595 L${w},624 Q${w * 0.5},634 0,640Z" fill="#E9C38D" opacity=".7"/>
      ${P('palm', 90, 680, 1, `<path d="M-10,0 Q-30,-160 20,-330 L42,-326 Q0,-160 18,0Z" ${ln('#A0703A', 2)}/>${[-160, -110, -60, -20, 30].map(a => `<path d="M30,-330 q${(90 * Math.cos(a * Math.PI / 180)).toFixed(0)},${(90 * Math.sin(a * Math.PI / 180)).toFixed(0)} ${(170 * Math.cos(a * Math.PI / 180)).toFixed(0)},${(170 * Math.sin(a * Math.PI / 180) + 70).toFixed(0)}" stroke="#3FA34D" stroke-width="30" fill="none" stroke-linecap="round"/>`).join('')}<circle cx="20" cy="-320" r="14" fill="#7a4e1f"/><circle cx="42" cy="-316" r="14" fill="#7a4e1f"/>`)}
      ${P('umbrella', 430, 735, 1, `<rect x="-5" y="-280" width="10" height="280" fill="#eee" stroke="#ccc"/><path d="M-180,-260 Q0,-400 180,-260Z" ${ln('#FECA57', 2)}/><path d="M-180,-260 Q-118,-360 -60,-310 L-60,-260Z M60,-260 L60,-310 Q118,-360 180,-260Z" fill="#FF6B8B"/>`)}
      <rect x="390" y="735" width="380" height="70" rx="12" ${ln('#48DBFB', 2)}/>${[0, 1, 2, 3, 4].map(i => `<rect x="${410 + i * 72}" y="735" width="30" height="70" fill="#fff" opacity=".7"/>`).join('')}
      <g><path d="M1085,720 L1215,600 M1215,720 L1085,600" stroke="#B8753A" stroke-width="10" stroke-linecap="round"/><rect x="1088" y="530" width="124" height="140" rx="10" ${ln('#FF6B8B', 2)}/>${[0, 1, 2].map(i => `<rect x="${1100 + i * 40}" y="530" width="18" height="140" fill="#fff" opacity=".8"/>`).join('')}<rect x="1080" y="660" width="140" height="24" rx="8" ${ln('#FF6B8B', 2)}/></g>
      ${P('crab', 860, 850, 1, `<path d="M-50,-20 l-24,10 M-50,-10 l-22,22 M50,-20 l24,10 M50,-10 l22,22" stroke="#C93A2E" stroke-width="7" stroke-linecap="round"/><ellipse cy="-30" rx="56" ry="34" ${ln('#F0553F', 2)}/><path d="M-44,-50 Q-80,-80 -70,-100 M44,-50 Q80,-80 70,-100" stroke="#F0553F" stroke-width="10" fill="none"/><circle cx="-72" cy="-104" r="16" fill="#F0553F"/><circle cx="72" cy="-104" r="16" fill="#F0553F"/><rect x="-22" y="-82" width="6" height="22" fill="#C93A2E"/><rect x="16" y="-82" width="6" height="22" fill="#C93A2E"/><circle cx="-19" cy="-86" r="9" fill="#fff"/><circle cx="19" cy="-86" r="9" fill="#fff"/><circle cx="-18" cy="-85" r="4.5" fill="#222"/><circle cx="20" cy="-85" r="4.5" fill="#222"/><path d="M-12,-26 Q0,-16 12,-26" stroke="#8a1f16" stroke-width="4" fill="none" stroke-linecap="round"/>`)}
      ${P('castle', 1370, 700, 0.9, `<rect x="-90" y="-90" width="180" height="90" ${ln('#E8BE7C', 2)}/><rect x="-110" y="-150" width="60" height="150" ${ln('#DDB06C', 2)}/><rect x="50" y="-150" width="60" height="150" ${ln('#DDB06C', 2)}/><rect x="-35" y="-190" width="70" height="110" ${ln('#E8BE7C', 2)}/>${[-110, -90, -70, 50, 70, 90].map(x => `<rect x="${x}" y="-166" width="14" height="18" fill="#DDB06C"/>`).join('')}<path d="M-20,0 L-20,-40 Q0,-62 20,-40 L20,0Z" fill="#9C7240"/><rect x="-2" y="-260" width="4" height="72" fill="#6b4a1a"/><path d="M2,-258 L46,-244 L2,-230Z" fill="#E84E4E"/>`)}
      ${P('icecream', 1630, 720, 1, `<rect x="-4" y="-340" width="8" height="190" fill="#999"/><path d="M-120,-300 Q0,-380 120,-300Z" ${ln('#FF8FB1', 2)}/><path d="M-120,-300 Q-60,-370 -40,-326Z M40,-326 Q60,-370 120,-300Z" fill="#fff"/><rect x="-120" y="-170" width="240" height="130" rx="16" ${ln('#FFF3D6', 2)}/><rect x="-120" y="-170" width="240" height="26" rx="10" fill="#48DBFB"/><circle cx="0" cy="-92" r="34" fill="#fff" stroke="#48DBFB" stroke-width="4"/><text x="0" y="-78" font-size="40" text-anchor="middle">🍦</text><circle cx="-80" cy="-30" r="26" ${ln('#555', 2)}/><circle cx="80" cy="-30" r="26" ${ln('#555', 2)}/><circle cx="-80" cy="-30" r="8" fill="#ccc"/><circle cx="80" cy="-30" r="8" fill="#ccc"/>`)}
      <g fill="#fff" opacity=".9"><path d="M820,880 a14,10 0 1 1 28,0Z"/><path d="M260,860 a12,9 0 1 1 24,0Z" fill="#FFB3C7"/><circle cx="1220" cy="800" r="6"/><circle cx="330" cy="680" r="5"/></g>`,
    seats: [{ x: 1150, y: 664, kind: 'sit', scale: 0.95, z: 690 }, { x: 580, y: 760, kind: 'lie', scale: 1, z: 740 }],
    surfaces: [],
    items: [['⚽', 980, 790], ['🐚', 700, 860]],
  },
  /* ------------------------------ PARK ------------------------------ */
  {
    key: 'park', name: 'פארק', icon: '🌳', w: 1800, color: '#C7F0BE',
    draw: (w) => `<defs><linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78C6F7"/><stop offset="1" stop-color="#DDF2FF"/></linearGradient></defs>
      <rect width="${w}" height="900" fill="url(#skyP)"/>
      <g class="drift" style="--w:${w + 500}px;animation-duration:80s">${cloud(-160, 140, 1)}${cloud(-900, 230, 0.75)}${cloud(-1500, 110, 0.6)}</g>
      <path d="M0,560 Q${w * 0.18},420 ${w * 0.38},540 Q${w * 0.58},440 ${w * 0.78},530 Q${w * 0.9},470 ${w},520 L${w},640 L0,640Z" fill="#A6DC93"/>
      ${Array.from({ length: Math.ceil(w / 60) }, (_, i) => `<rect x="${i * 60 + 10}" y="540" width="16" height="76" rx="6" fill="#fff" opacity=".9"/>`).join('')}<rect y="560" width="${w}" height="10" fill="#fff" opacity=".9"/><rect y="590" width="${w}" height="10" fill="#fff" opacity=".9"/>
      <rect y="${FT}" width="${w}" height="${900 - FT}" fill="#7CC96B"/>
      <path d="M720,${FT} Q640,760 470,900 L860,900 Q900,760 860,${FT}Z" fill="#E9D7A8" opacity=".9"/>
      <ellipse cx="1180" cy="820" rx="150" ry="40" ${ln('#5BB8F0', 3)}/><ellipse cx="1150" cy="812" rx="60" ry="12" fill="#fff" opacity=".4"/>
      ${P('tree', 230, 650, 1.05, treeInner)}
      ${P('swing', 700, 650, 1, `<path d="M-120,0 L-80,-300 M120,0 L80,-300" stroke="#D9542F" stroke-width="16" stroke-linecap="round"/><path d="M-96,-300 L96,-300" stroke="#C4462A" stroke-width="18" stroke-linecap="round"/><g class="seat"><path d="M-40,-296 L-40,-96 M40,-296 L40,-96" stroke="#6b4a1a" stroke-width="5"/><rect x="-58" y="-104" width="116" height="18" rx="6" ${ln('#FECA57', 2)}/></g>`)}
      ${P('slide', 1010, 660, 1, `<path d="M-140,0 L-140,-280 M-90,0 L-90,-280" stroke="#5F7FFF" stroke-width="12"/>${[1, 2, 3, 4, 5].map(i => `<path d="M-140,${-i * 50} L-90,${-i * 50}" stroke="#5F7FFF" stroke-width="9"/>`).join('')}<rect x="-150" y="-292" width="80" height="18" rx="6" fill="#3E5FD9"/><path d="M-80,-282 Q20,-270 40,-140 Q58,-14 160,-10" stroke="#FF6B8B" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M-80,-298 Q24,-286 46,-150" stroke="#FF8FA6" stroke-width="8" fill="none" stroke-linecap="round"/>`)}
      ${P('sun', w - 200, 150, 1, sunInner())}
      <g><rect x="1350" y="580" width="200" height="16" rx="6" ${ln('#B8753A', 2)}/><rect x="1350" y="604" width="200" height="14" rx="6" ${ln('#B8753A', 2)}/><rect x="1360" y="640" width="10" height="60" fill="#555"/><rect x="1530" y="640" width="10" height="60" fill="#555"/><rect x="1345" y="630" width="210" height="16" rx="6" ${ln('#C9874B', 2)}/></g>
      ${[[90, '#FF6B8B'], [420, '#FECA57'], [940, '#A55EEA'], [1000, '#FF9F43'], [1300, '#48DBFB'], [1700, '#FF6B8B']].map(([x, c], i) => P('flower', x, 885 - (i % 2) * 30, 0.9 + (i % 3) * 0.1, flowerInner(c))).join('')}`,
    seats: [{ x: 700, y: 552, kind: 'swing', scale: 0.92, z: 660, bar: 350 }, { x: 1405, y: 632, kind: 'sit', scale: 0.95, z: 700 }, { x: 1495, y: 632, kind: 'sit', scale: 0.95, z: 700 }],
    surfaces: [],
    items: [['🐶', 1250, 760], ['🪁', 520, 700]],
  },
  /* ------------------------------ KITCHEN ------------------------------ */
  {
    key: 'kitchen', name: 'מטבח', icon: '🍳', w: 1500, color: '#FFE9C2',
    draw: (w) => room(w, { wall: '#FFF1D6', wall2: '#FFE2B0', pattern: 'stripes', floor: '#F4E3C3', floor2: '#E2C493', floorKind: 'checker' }) + `
      <rect x="62" y="30" width="18" height="${FT}" fill="#E7B98A"/>
      <g transform="translate(760 70)"><rect width="260" height="200" rx="10" fill="#fff"/><rect x="12" y="12" width="236" height="176" fill="#9AD8FF"/>${cloud(90, 90, 0.5)}<rect x="124" y="12" width="12" height="176" fill="#fff"/><path d="M-20,-10 L280,-10 L260,40 L0,40Z" fill="#FF6B8B"/><path d="M0,40 Q30,60 60,40 Q90,60 120,40 Q150,60 180,40 Q210,60 240,40 Q260,55 260,40" fill="#FF6B8B"/></g>
      <g transform="translate(560 110)"><circle r="54" fill="#fff" stroke="#5F7FFF" stroke-width="8"/><path d="M0,0 L0,-34 M0,0 L24,10" stroke="#333" stroke-width="6" stroke-linecap="round"/></g>
      ${P('fridge', 300, 660, 1, `<rect x="-100" y="-440" width="200" height="440" rx="20" ${ln('#E9F3FA', 3)}/><path d="M-100,-290 L100,-290" stroke="#b9c8d4" stroke-width="4"/><rect x="64" y="-420" width="12" height="100" rx="6" fill="#9fb3c2"/><rect x="64" y="-260" width="12" height="150" rx="6" fill="#9fb3c2"/><circle cx="-50" cy="-380" r="12" fill="#FF6B8B"/><rect x="-30" y="-360" width="34" height="26" rx="4" fill="#FECA57" transform="rotate(-8)"/><circle cx="-60" cy="-220" r="10" fill="#1DD1A1"/>`)}
      ${P('trash', 120, 720, 1, `<rect x="-42" y="-110" width="84" height="110" rx="10" ${ln('#7BC47F', 3)}/><rect x="-50" y="-126" width="100" height="22" rx="8" ${ln('#5BA85F', 3)}/><path d="M-20,-90 L-20,-20 M0,-90 L0,-20 M20,-90 L20,-20" stroke="#5BA85F" stroke-width="5"/>`)}
      <g><rect x="620" y="598" width="320" height="22" rx="8" ${ln('#C9874B', 3)}/><rect x="640" y="620" width="16" height="96" fill="#A86A36"/><rect x="904" y="620" width="16" height="96" fill="#A86A36"/><path d="M640,598 Q700,640 760,598 Q820,640 900,598" fill="#FF8FB1" opacity=".7"/></g>
      <g><rect x="512" y="510" width="18" height="160" rx="6" ${ln('#B8753A', 2)}/><rect x="512" y="648" width="100" height="16" rx="6" ${ln('#B8753A', 2)}/><rect x="520" y="664" width="10" height="60" fill="#8B5A2B"/><rect x="595" y="664" width="10" height="60" fill="#8B5A2B"/></g>
      <g><rect x="1030" y="510" width="18" height="160" rx="6" ${ln('#B8753A', 2)}/><rect x="948" y="648" width="100" height="16" rx="6" ${ln('#B8753A', 2)}/><rect x="955" y="664" width="10" height="60" fill="#8B5A2B"/><rect x="1030" y="664" width="10" height="60" fill="#8B5A2B"/></g>
      <rect x="1120" y="330" width="${w - 1120}" height="200" fill="#fff" opacity=".7"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${1120 + i * 66},330 L${1120 + i * 66},530" stroke="#E2E8F0" stroke-width="3"/>`).join('')}
      <rect x="1180" y="200" width="260" height="110" rx="12" ${ln('#FFB3C7', 2)}/><rect x="1196" y="300" width="228" height="14" fill="#E890AA"/>
      <rect x="1110" y="540" width="${w - 1110}" height="130" ${ln('#FFB3C7', 3)}/><rect x="1100" y="526" width="${w - 1090}" height="22" rx="6" ${ln('#F5F5F5', 2)}/>${[1130, 1270].map(x => `<rect x="${x}" y="566" width="120" height="86" rx="8" fill="#FFC6D5" stroke="#E890AA" stroke-width="2"/><rect x="${x + 50}" y="574" width="20" height="6" rx="3" fill="#C96A86"/>`).join('')}
      ${P('stove', 1270, 528, 1, `<rect x="-110" y="-8" width="220" height="10" fill="#555"/><ellipse cx="-50" cy="-8" rx="36" ry="9" fill="#333"/><ellipse cx="50" cy="-8" rx="36" ry="9" fill="#333"/><path d="M14,-14 L86,-14 L80,-64 L20,-64Z" ${ln('#5F7FFF', 3)}/><rect x="10" y="-72" width="80" height="12" rx="5" fill="#3E5FD9"/><path d="M-50,-30 q-10,-20 0,-40 q10,-20 0,-40" stroke="#fff" stroke-width="6" fill="none" opacity=".7" class="steam"/>`)}`,
    seats: [{ x: 560, y: 650, kind: 'sit', scale: 0.92, z: 700 }, { x: 1000, y: 650, kind: 'sit', scale: 0.92, z: 700 }],
    surfaces: [{ x1: 630, x2: 930, y: 600, scale: 0.85 }, { x1: 1110, x2: 1490, y: 528, scale: 0.78 }],
    items: [['🍎', 700, 600], ['🥛', 860, 600], ['🍌', 1440, 528]],
  },
  /* ------------------------------ LIVING ROOM ------------------------------ */
  {
    key: 'living', name: 'סלון', icon: '🛋️', w: 1700, color: '#FFE6CC',
    draw: (w) => room(w, { wall: '#FDE8CF', wall2: '#FBDDBC', pattern: 'stripes', floor: '#D8A46A', floor2: '#C48E55' }) + `
      <g transform="translate(330 120)"><rect width="180" height="140" rx="6" fill="#B8753A"/><rect x="12" y="12" width="156" height="116" fill="#FFF"/><path d="M40,110 L40,70 L80,40 L120,70 L120,110Z" fill="#FF9F43"/><path d="M30,74 L80,34 L130,74" stroke="#E84E4E" stroke-width="8" fill="none"/><rect x="70" y="84" width="20" height="26" fill="#5F7FFF"/><circle cx="140" cy="36" r="14" fill="#FECA57"/></g>
      <g transform="translate(${1000 - 160} 60)"><rect width="320" height="260" rx="12" fill="#fff"/><rect x="14" y="14" width="292" height="232" fill="#9AD8FF"/>${cloud(110, 110, 0.6)}<circle cx="240" cy="70" r="26" fill="#FFD43B"/><rect x="154" y="14" width="12" height="232" fill="#fff"/><rect x="14" y="124" width="292" height="12" fill="#fff"/><path d="M-30,-14 L60,-14 Q40,120 70,300 L-30,300Z" fill="#FF8FB1"/><path d="M350,-14 L260,-14 Q280,120 250,300 L350,300Z" fill="#FF8FB1"/><rect x="-40" y="-26" width="400" height="16" rx="8" fill="#B8753A"/></g>
      <ellipse cx="1000" cy="790" rx="380" ry="80" fill="#A55EEA" opacity=".5"/><ellipse cx="1000" cy="790" rx="320" ry="58" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="16 14" opacity=".7"/>
      ${P('lamp', 140, 650, 1, `<circle cy="-340" r="160" fill="#FFF3A0" opacity=".55" class="glow"/><ellipse cy="-4" rx="50" ry="12" fill="#7a5a3a"/><rect x="-6" y="-300" width="12" height="300" fill="#7a5a3a"/><path d="M-70,-280 L-44,-380 L44,-380 L70,-280Z" ${ln('#FECA57', 3)}/>`)}
      ${P('tv', 420, 660, 1, `<rect x="-140" y="-130" width="280" height="130" rx="10" ${ln('#B8753A', 3)}/><rect x="-126" y="-88" width="116" height="64" rx="6" fill="#C9874B"/><rect x="10" y="-88" width="116" height="64" rx="6" fill="#C9874B"/><rect x="-120" y="-320" width="240" height="176" rx="14" fill="#333"/><rect x="-108" y="-308" width="216" height="152" rx="6" class="screen"/><rect x="-10" y="-146" width="20" height="18" fill="#333"/>`)}
      <g><rect x="740" y="400" width="520" height="160" rx="44" ${ln('#5F7FFF', 3)}/><rect x="770" y="520" width="460" height="96" rx="24" ${ln('#7B95FF', 3)}/><rect x="710" y="480" width="80" height="160" rx="32" ${ln('#4A68E8', 3)}/><rect x="1210" y="480" width="80" height="160" rx="32" ${ln('#4A68E8', 3)}/><rect x="760" y="636" width="18" height="40" fill="#7a5a3a"/><rect x="1222" y="636" width="18" height="40" fill="#7a5a3a"/><rect x="800" y="440" width="100" height="80" rx="20" ${ln('#FECA57', 2)} transform="rotate(-8 850 480)"/><rect x="1100" y="440" width="100" height="80" rx="20" ${ln('#FF8FB1', 2)} transform="rotate(8 1150 480)"/></g>
      <g><rect x="880" y="726" width="240" height="20" rx="8" ${ln('#C9874B', 3)}/><rect x="900" y="746" width="14" height="50" fill="#A86A36"/><rect x="1086" y="746" width="14" height="50" fill="#A86A36"/></g>
      <g><rect x="1420" y="160" width="220" height="16" rx="6" fill="#B8753A"/><rect x="1440" y="100" width="30" height="60" fill="#FF6B8B"/><rect x="1474" y="86" width="26" height="74" fill="#48DBFB"/><rect x="1504" y="108" width="34" height="52" fill="#FECA57"/></g>
      ${P('plant', 1600, 660, 1, `<path d="M-44,-96 L44,-96 L32,0 L-32,0Z" ${ln('#E86F4E', 3)}/>${[-50, -20, 10, 40].map((a, i) => `<ellipse cx="${a * 0.6}" cy="-${160 + (i % 2) * 30}" rx="20" ry="66" ${ln(i % 2 ? '#47A84E' : '#58BC5C', 2)} transform="rotate(${a * 0.6} ${a * 0.6} -100)"/>`).join('')}`)}`,
    seats: [{ x: 880, y: 528, kind: 'sit', scale: 0.88, z: 670 }, { x: 1000, y: 528, kind: 'sit', scale: 0.88, z: 670 }, { x: 1120, y: 528, kind: 'sit', scale: 0.88, z: 670 }],
    surfaces: [{ x1: 890, x2: 1110, y: 728, scale: 0.95 }, { x1: 290, x2: 550, y: 532, scale: 0.75 }],
    items: [['🐱', 1350, 800], ['🍪', 960, 728], ['🎮', 1060, 728]],
  },
  /* ------------------------------ BATHROOM ------------------------------ */
  {
    key: 'bath', name: 'אמבטיה', icon: '🛁', w: 1300, color: '#D6F2FF',
    draw: (w) => room(w, { wall: '#DDF4FF', wall2: '#BFE6F7', pattern: 'tiles', floor: '#E6F0F5', floor2: '#C9DCE6', floorKind: 'checker', base: '#fff' }) + `
      <rect x="180" y="540" width="420" height="80" rx="30" fill="#A7DBF2"/><ellipse cx="390" cy="566" rx="200" ry="30" fill="#7CC9EE"/>
      <path d="M560,560 L560,470 Q560,450 540,450 L520,450" stroke="#B0BEC5" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="520" cy="452" r="10" fill="#90A4AE"/>
      <g transform="translate(760 140)"><ellipse cx="0" cy="110" rx="100" ry="130" fill="#fff" stroke="#B0BEC5" stroke-width="10"/></g>
      ${P('mirror', 760, 380, 1, `<ellipse cx="0" cy="-130" rx="90" ry="120" fill="#C9EEFF"/><path d="M-50,-200 L-10,-240 M-40,-150 L20,-210" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/><text x="0" y="-100" font-size="54" text-anchor="middle" opacity=".85">💇</text>`)}
      <g><rect x="690" y="500" width="140" height="28" rx="10" ${ln('#fff', 3)}/><rect x="735" y="528" width="50" height="160" ${ln('#fff', 3)}/><rect x="752" y="480" width="16" height="24" rx="4" fill="#B0BEC5"/></g>
      ${P('toilet', 1060, 700, 1, `<rect x="-60" y="-240" width="120" height="110" rx="16" ${ln('#fff', 3)}/><rect x="-20" y="-232" width="40" height="10" rx="5" fill="#B0BEC5"/><path d="M-70,-120 L70,-120 Q70,-60 30,-40 L30,0 L-30,0 L-30,-40 Q-70,-60 -70,-120Z" ${ln('#fff', 3)}/><ellipse cy="-122" rx="74" ry="16" ${ln('#E0F2FA', 3)}/>`)}
      <g><rect x="1180" y="240" width="90" height="12" rx="6" fill="#B0BEC5"/><rect x="1190" y="250" width="70" height="140" rx="10" fill="#FF8FB1"/><rect x="1190" y="350" width="70" height="12" fill="#fff" opacity=".7"/></g>
      ${P('tub', 390, 470, 1, `<rect x="-200" y="0" width="400" height="80" fill="#000" opacity="0"/><g class="bubbles">${[-150, -90, -20, 50, 120].map((x, i) => `<circle cx="${x}" cy="${60 - (i % 2) * 18}" r="${20 + (i % 3) * 6}" fill="#fff" opacity=".85"/>`).join('')}</g>`)}`,
    fronts: [{ z: 760, svg: `<rect x="170" y="600" width="440" height="120" rx="36" ${ln('#fff', 4)}/><rect x="190" y="612" width="400" height="14" rx="7" fill="#E3F4FB"/>${[-170, -100, -30, 40, 110, 170].map((x, i) => `<circle cx="${390 + x}" cy="${604 - (i % 2) * 8}" r="${18 + (i % 3) * 5}" fill="#fff" stroke="#DDEFF7" stroke-width="2"/>`).join('')}<path d="M210,720 l-10,36 M570,720 l10,36" stroke="#B0BEC5" stroke-width="12" stroke-linecap="round"/>` }],
    seats: [{ x: 390, y: 672, kind: 'sit', scale: 0.9, z: 740 }, { x: 1060, y: 590, kind: 'sit', scale: 0.9, z: 710 }],
    surfaces: [{ x1: 690, x2: 830, y: 502, scale: 0.72 }],
    items: [['🦆', 300, 780], ['🧼', 800, 502]],
  },
  /* ------------------------------ BEDROOM ------------------------------ */
  {
    key: 'bedroom', name: 'חדר שינה', icon: '🛏️', w: 1700, color: '#EAE2FF',
    draw: (w) => room(w, { wall: '#E5DCFF', wall2: '#ffffff', pattern: 'dots', floor: '#CFA77F', floor2: '#BC9269' }) + `
      <ellipse cx="860" cy="790" rx="300" ry="74" fill="#FF8FB1" opacity=".55"/>
      ${P('window', 760, 360, 1, `<rect x="-150" y="-290" width="300" height="250" rx="120" fill="#fff"/><rect x="-136" y="-276" width="272" height="222" rx="108" class="wsky" fill="#9AD8FF"/><circle cx="60" cy="-200" r="30" fill="#FFD43B" class="wsun"/><g class="wmoon"><circle cx="60" cy="-200" r="30" fill="#FFF3B0"/><circle cx="74" cy="-210" r="26" fill="#1d2357"/></g><g class="wstars" fill="#FFF3B0"><circle cx="-60" cy="-210" r="4"/><circle cx="-20" cy="-140" r="3"/><circle cx="-90" cy="-120" r="3.5"/><circle cx="10" cy="-230" r="3"/></g><rect x="-6" y="-276" width="12" height="222" fill="#fff"/><rect x="-136" y="-160" width="272" height="10" fill="#fff"/><rect x="-170" y="-50" width="340" height="18" rx="8" fill="#fff"/>`)}
      <g><rect x="140" y="360" width="46" height="340" rx="18" ${ln('#B8753A', 3)}/><rect x="166" y="400" width="80" height="200" rx="30" fill="#C9874B"/><rect x="170" y="556" width="500" height="60" rx="18" ${ln('#fff', 3)}/><rect x="236" y="512" width="150" height="64" rx="28" ${ln('#FFF3F8', 3)}/></g>
      ${P('wardrobe', 1080, 660, 1, `<rect x="-140" y="-470" width="280" height="470" rx="16" ${ln('#C9874B', 3)}/><rect x="-126" y="-450" width="124" height="420" rx="10" fill="#D99A5E"/><rect x="2" y="-450" width="124" height="420" rx="10" fill="#D99A5E"/><circle cx="-16" cy="-240" r="9" fill="#FFD43B"/><circle cx="16" cy="-240" r="9" fill="#FFD43B"/><path d="M-150,-470 Q0,-520 150,-470Z" fill="#B8753A"/><text x="0" y="-330" font-size="60" text-anchor="middle">👗</text>`)}
      <g><rect x="1380" y="250" width="260" height="16" rx="6" fill="#B8753A"/><rect x="1400" y="190" width="30" height="60" fill="#FF6B8B"/><rect x="1434" y="176" width="26" height="74" fill="#48DBFB"/><circle cx="1530" cy="220" r="30" fill="#1DD1A1"/><path d="M1580,250 L1600,190 L1620,250Z" fill="#A55EEA"/></g>
      <g><rect x="1360" y="556" width="280" height="22" rx="8" ${ln('#C9874B', 3)}/><rect x="1376" y="578" width="16" height="110" fill="#A86A36"/><rect x="1608" y="578" width="16" height="110" fill="#A86A36"/><rect x="1400" y="470" width="10" height="86" fill="#888"/><path d="M1380,470 L1430,470 L1420,440 L1390,440Z" fill="#FECA57"/></g>
      ${P('toybox', 760, 740, 1, `<rect x="-100" y="-120" width="200" height="120" rx="12" ${ln('#FF9F43', 3)}/><rect x="-110" y="-136" width="220" height="30" rx="10" ${ln('#E8862C', 3)}/><circle cx="-40" cy="-60" r="18" fill="#FECA57"/><path d="M20,-80 l12,24 26,4 -19,18 5,26 -24,-13 -24,13 5,-26 -19,-18 26,-4Z" fill="#fff" transform="translate(10 6) scale(.8)"/>`)}`,
    fronts: [{ z: 705, svg: `<path d="M436,546 Q440,532 470,532 Q570,526 672,540 L672,622 L436,622Z" ${ln('#A55EEA', 3)}/>${[0, 1, 2].map(i => `<circle cx="${490 + i * 70}" cy="584" r="12" fill="#fff" opacity=".6"/>`).join('')}<rect x="160" y="616" width="520" height="70" rx="16" ${ln('#B8753A', 3)}/><rect x="180" y="686" width="22" height="24" fill="#8B5A2B"/><rect x="640" y="686" width="22" height="24" fill="#8B5A2B"/>` }],
    seats: [{ x: 450, y: 566, kind: 'lie', scale: 0.86, z: 700, bed: true }],
    surfaces: [{ x1: 1370, x2: 1630, y: 558, scale: 0.78 }],
    items: [['🧸', 1250, 790], ['📚', 1500, 558], ['🎈', 600, 840]],
  },
];

const FOOD = '🍎🍌🍓🍕🍔🍩🧁🍦🍧🍉🥕🍪🥛🧃🍰🌭🥨🍇🍳🥞🍲🍒🥐🍿🍫🍭☕🥧🍮🥚🍯🥪';
const isFood = (e) => FOOD.includes(e);
const PETS = { '🐶': 'woof', '🐱': 'meow', '🦆': 'quack', '🐰': 'pop', '🐷': 'oink', '🐮': 'moo', '🐔': 'cluck', '🐑': 'baa', '🐴': 'neigh', '🦄': 'neigh', '🐣': 'cluck' };
const SPAWN = {
  fridge: ['🍎', '🍌', '🍓', '🥕', '🧃', '🥛', '🍉', '🍇', '🍰', '🍒'],
  stove: ['🍳', '🥞', '🍲', '🍕'],
  icecream: ['🍦', '🍧', '🍭', '🍉'],
  tree: ['🍎'],
  toybox: ['🧸', '⚽', '🎈', '🪀', '🚗', '🦖', '🎸', '🪁', '🐰', '🎨'],
};
