/**
 * SVGs da trilha (Figma), como texto para o `SvgCss`. No APK release, o uri de
 * `Asset.fromModule` vira nome de recurso do Android, o `SvgCssUri` não consegue
 * buscá-lo e a arte some; no Expo Go funcionava porque o uri é do Metro.
 */

// Círculo do nível.
export const levelSvg = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="78" height="81" viewBox="0 0 78 81" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Group 20">
<circle id="Ellipse 23" cx="40.5" cy="43.5" r="37.5" fill="#223FBF"/>
<circle id="Ellipse 24" cx="37.5" cy="37.5" r="37.5" fill="#2968F4"/>
</g>
</svg>`;

// Estrelas de nível com 1 estrela (as demais em cinza). Provisória até o design confirmar.
export const stars1Svg = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="80.6399" height="32" viewBox="0 0 80.6399 32" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="Group 19">
<g id="Star 1">
<use xlink:href="#stroke0_0_84" fill="#FFF200"/>
<mask id="stroke1_0_84" fill="white">
<use xlink:href="#stroke0_0_84"/>
</mask>
<path d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke1_0_84)"/>
</g>
<g id="Star 2">
<use xlink:href="#stroke2_0_84" fill="#606060"/>
<mask id="stroke3_0_84" fill="white">
<use xlink:href="#stroke2_0_84"/>
</mask>
<path d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z" stroke-width="2" stroke="#8A8A8A" mask="url(#stroke3_0_84)"/>
</g>
<g id="Star 3">
<use xlink:href="#stroke4_0_84" fill="#606060"/>
<mask id="stroke5_0_84" fill="white">
<use xlink:href="#stroke4_0_84"/>
</mask>
<path d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z" stroke-width="2" stroke="#8A8A8A" mask="url(#stroke5_0_84)"/>
</g>
</g>
<defs>
<path id="stroke0_0_84" d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z"/>
<path id="stroke2_0_84" d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z"/>
<path id="stroke4_0_84" d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z"/>
</defs>
</svg>`;

// Estrelas de nível com 2 estrelas. Provisória até o design confirmar.
export const stars2Svg = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="80.6399" height="32" viewBox="0 0 80.6399 32" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="Group 19">
<g id="Star 1">
<use xlink:href="#stroke0_0_84" fill="#FFF200"/>
<mask id="stroke1_0_84" fill="white">
<use xlink:href="#stroke0_0_84"/>
</mask>
<path d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke1_0_84)"/>
</g>
<g id="Star 2">
<use xlink:href="#stroke2_0_84" fill="#FFF200"/>
<mask id="stroke3_0_84" fill="white">
<use xlink:href="#stroke2_0_84"/>
</mask>
<path d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke3_0_84)"/>
</g>
<g id="Star 3">
<use xlink:href="#stroke4_0_84" fill="#606060"/>
<mask id="stroke5_0_84" fill="white">
<use xlink:href="#stroke4_0_84"/>
</mask>
<path d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z" stroke-width="2" stroke="#8A8A8A" mask="url(#stroke5_0_84)"/>
</g>
</g>
<defs>
<path id="stroke0_0_84" d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z"/>
<path id="stroke2_0_84" d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z"/>
<path id="stroke4_0_84" d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z"/>
</defs>
</svg>`;

// Estrelas de nível com 3 estrelas.
export const stars3Svg = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="80.6399" height="32" viewBox="0 0 80.6399 32" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="Group 19">
<g id="Star 1">
<use xlink:href="#stroke0_0_84" fill="#FFF200"/>
<mask id="stroke1_0_84" fill="white">
<use xlink:href="#stroke0_0_84"/>
</mask>
<path d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke1_0_84)"/>
</g>
<g id="Star 2">
<use xlink:href="#stroke2_0_84" fill="#FFF200"/>
<mask id="stroke3_0_84" fill="white">
<use xlink:href="#stroke2_0_84"/>
</mask>
<path d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke3_0_84)"/>
</g>
<g id="Star 3">
<use xlink:href="#stroke4_0_84" fill="#FFF200"/>
<mask id="stroke5_0_84" fill="white">
<use xlink:href="#stroke4_0_84"/>
</mask>
<path d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z" stroke-width="2" stroke="#FFC400" mask="url(#stroke5_0_84)"/>
</g>
</g>
<defs>
<path id="stroke0_0_84" d="M10.88 0L13.3227 7.51789L21.2275 7.5179L14.8324 12.1642L17.2751 19.6821L10.88 15.0358L4.4849 19.6821L6.92761 12.1642L0.532505 7.5179L8.43729 7.51789L10.88 0Z"/>
<path id="stroke2_0_84" d="M40.32 10.24L42.7627 17.7579L50.6675 17.7579L44.2724 22.4042L46.7151 29.9221L40.32 25.2758L33.9249 29.9221L36.3676 22.4042L29.9725 17.7579L37.8773 17.7579L40.32 10.24Z"/>
<path id="stroke4_0_84" d="M69.76 0L72.2027 7.51789L80.1075 7.5179L73.7124 12.1642L76.1551 19.6821L69.76 15.0358L63.3649 19.6821L65.8076 12.1642L59.4125 7.5179L67.3173 7.51789L69.76 0Z"/>
</defs>
</svg>`;

// Nuvem sobre nível ainda não alcançado.
export const cloudSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="97" height="72.095" viewBox="0 0 97 73" fill="none">
  <circle cx="14.4189" cy="43.2568" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="28.8379" cy="28.8379" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="32.7705" cy="47.1892" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="51.1216" cy="57.6756" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="53.7431" cy="43.2568" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="68.1621" cy="47.1892" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="68.1621" cy="28.8379" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="47.1894" cy="14.4189" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="47.1894" cy="28.8379" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="82.581" cy="32.7702" r="14.4189" fill="white" fill-opacity="0.94"/>
  <circle cx="79.9594" cy="57.6756" r="14.4189" fill="white" fill-opacity="0.94"/>
</svg>`;
