/* Side-view vehicle illustrations (original artwork, 240×120). */

const wheel = (x) => `<circle cx="${x}" cy="94" r="13" fill="#1b2421"/><circle cx="${x}" cy="94" r="5.5" fill="#c9d1cd"/>`;
const shadow = (x1, x2) => `<ellipse cx="${(x1 + x2) / 2}" cy="108" rx="${(x2 - x1) / 2}" ry="5" fill="#0e1513" opacity=".1"/>`;
const sensor = (x) => `<rect x="${x - 9}" y="15" width="18" height="8" rx="4" fill="#1b2421"/><rect x="${x - 5}" y="17" width="10" height="3" rx="1.5" fill="#2fd18f"/>`;
const glass = '#bcd3df';
const glassHi = '#e3eef3';

const ART = {
  pod: () => `${shadow(54, 186)}
    <path d="M58 88V70c0-26 26-46 62-46s62 20 62 46v18a6 6 0 01-6 6H64a6 6 0 01-6-6z" fill="#17211e"/>
    <path d="M80 62c4-14 20-26 40-26s36 12 40 26z" fill="${glass}"/><path d="M92 50c6-6 16-10 28-10v22H86z" fill="${glassHi}"/>
    <path d="M58 74h124" stroke="#2fd18f" stroke-width="3"/>
    <rect x="113" y="66" width="3" height="22" rx="1.5" fill="#0b110f"/>
    ${sensor(120)} ${wheel(86)} ${wheel(154)}`,
  shared: () => `${shadow(26, 214)}
    <path d="M28 90V68c0-7 5-12 12-13l30-4 22-20c3-3 7-4 11-4h60c14 0 26 9 32 21l12 22c2 3 3 7 3 11v9a5 5 0 01-5 5H33a5 5 0 01-5-5z" fill="#2453c4"/>
    <path d="M80 55l17-17c2-2 4-3 7-3h28v20z" fill="${glass}"/><path d="M138 35h18c10 0 18 6 23 15l3 5h-44z" fill="${glass}"/>
    <path d="M88 52l11-11h20v11z" fill="${glassHi}"/>
    <path d="M28 74h188" stroke="#fff" stroke-width="2" opacity=".35"/>
    <rect x="203" y="68" width="10" height="6" rx="2" fill="#fff3c4"/>
    ${sensor(126)} ${wheel(66)} ${wheel(176)}`,
  shuttle: () => `${shadow(20, 220)}
    <rect x="20" y="26" width="200" height="68" rx="18" fill="#0a7a52"/>
    <rect x="32" y="36" width="156" height="28" rx="7" fill="${glass}"/>
    <path d="M70 36v28M108 36v28M150 36v28" stroke="#0a7a52" stroke-width="4"/>
    <rect x="36" y="40" width="28" height="9" rx="3" fill="${glassHi}"/>
    <rect x="196" y="36" width="16" height="36" rx="6" fill="${glass}"/>
    <path d="M110 64v28M148 64v28" stroke="#075c3e" stroke-width="2.5"/>
    <path d="M20 74h200" stroke="#2fd18f" stroke-width="3"/>
    ${sensor(120)} ${wheel(58)} ${wheel(184)}`,
  bus: () => `${shadow(8, 232)}
    <rect x="8" y="22" width="224" height="72" rx="14" fill="#0b7285"/>
    <rect x="18" y="32" width="178" height="30" rx="6" fill="${glass}"/>
    <path d="M54 32v30M90 32v30M126 32v30M162 32v30" stroke="#0b7285" stroke-width="4"/>
    <rect x="22" y="36" width="26" height="9" rx="3" fill="${glassHi}"/>
    <rect x="204" y="32" width="20" height="40" rx="6" fill="${glass}"/>
    <rect x="160" y="25" width="40" height="5" rx="2.5" fill="#ffd36b"/>
    <path d="M92 62v30M126 62v30" stroke="#085766" stroke-width="2.5"/>
    <path d="M8 76h224" stroke="#fff" stroke-width="3" opacity=".5"/>
    ${sensor(110)} ${wheel(48)} ${wheel(192)}`,
  community: () => `${shadow(22, 218)}
    <path d="M22 90V72c0-7 4-11 11-13l33-5 24-20c3-2 6-3 10-3h52c11 0 21 7 26 16l4 7 19 5c8 2 13 8 13 15v16a5 5 0 01-5 5H27a5 5 0 01-5-5z" fill="#c76a0a"/>
    <path d="M80 55l15-13c2-2 4-2 7-2h22v15z" fill="${glass}"/><path d="M130 40h20c8 0 15 5 18 12l2 3h-40z" fill="${glass}"/>
    <path d="M86 52l9-8h16v8z" fill="${glassHi}"/>
    <circle cx="120" cy="76" r="9" fill="#fff"/><path d="M120 81c-3-2-4.5-3.4-4.5-5a2.2 2.2 0 014.5-.8 2.2 2.2 0 014.5.8c0 1.6-1.5 3-4.5 5z" fill="#c76a0a"/>
    ${sensor(124)} ${wheel(64)} ${wheel(178)}`,
  siren: () => `${shadow(18, 222)}
    <path d="M18 90V42c0-9 7-16 16-16h128c14 0 25 7 32 18l20 24c4 4 6 10 6 15v7a5 5 0 01-5 5H23a5 5 0 01-5-5z" fill="#f7f8f8" stroke="#d5dbd8" stroke-width="2"/>
    <path d="M18 66h202" stroke="#c62d25" stroke-width="10"/>
    <path d="M164 34h4c8 0 16 4 21 11l9 11h-34z" fill="${glass}"/>
    <rect x="58" y="38" width="20" height="20" rx="3" fill="#c62d25"/><path d="M68 42v12M62 48h12" stroke="#fff" stroke-width="4"/>
    <rect x="96" y="16" width="44" height="10" rx="4" fill="#c62d25"/><rect x="118" y="16" width="22" height="10" rx="4" fill="#2453c4"/>
    ${wheel(62)} ${wheel(178)}`
};

export function vehicleArt(icon, label = '') {
  const draw = ART[icon] || ART.pod;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg class="vill" viewBox="0 0 240 120" ${a11y}>${draw()}</svg>`;
}
