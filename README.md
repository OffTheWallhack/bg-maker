# BG Lab

Generátor textúrovaných pozadí pre Instagram a ďalšie siete. React + TypeScript + Vite, WebGL2 (jeden fragment shader na textúru). UI po slovensky.

```bash
npm install
npm run dev        # vývoj
npm run build      # produkčný build do dist/
```

## Ako to funguje

1. **Pass 1** – shader vybranej textúry sa vykreslí do offscreen framebufferu (`src/textures/*.ts`).
2. **Pass 2** – „finish“ shader (`src/gl/finishShader.ts`): globálne farby, duotone a vrstva špiny (zrno, prach, xerox, light leak, calm zone…).
3. Náhľad sa kreslí v zníženom rozlíšení, export (PNG/JPG/video) vo plnom rozlíšení formátu. Zrno a špina sú v „referenčných pixeloch“ (1920), takže náhľad a export vyzerajú rovnako.
4. Rovnaké nastavenie + seed = rovnaký obrázok (hash je celočíselný PCG, nie `sin`).

## Ako pridať novú textúru

1. Skopíruj `src/textures/_template.ts` ako napr. `src/textures/51-moja-textura.ts`.
2. Zmeň `id`, `name`, `category` (`print`, `material`, `light`, `geometry`, `glitch`).
3. Do `params` pridaj parametre cez `R` (slider), `T` (prepínač), `S` (výber), `C` (farba). Každý sa stane uniformom `u_<id>` a automaticky dostane ovládací prvok.
4. Napíš GLSL funkciu `vec3 tex(vec2 p, vec2 uv)`:
   - `p` – stredové súradnice, výška = 1 (y ∈ −0.5…0.5, y hore), `uv` – 0…1.
   - paleta: `u_bg, u_ink1, u_ink2, u_hi, u_dirt`, `ramp(t)` (paleta zoradená od tmavej po svetlú), `inkOn(base, ink, a)`.
   - seed: pripočítaj `u_so` (alebo `SOF`) k súradniciam šumu.
   - utility: `hash, vnoise, gnoise, fbm, tfbm, ridged, voronoi, voronoiEdge, warp, htDots, htLines, bayer, rot, aaLine, segDist` (viď `src/gl/glsl.ts`).
5. **Slučka bez švu**: pohyb rob len cez `TT` (uhol 0…2π·cykly) vnútri `sin/cos`, alebo cez `tfbm()` / `tnoise()` / `voronoi(p, mv)`, ktoré sú periodické. Generický pohyb (drift, pulz, blikanie, posun, rotácia) sa aplikuje automaticky.
6. Hotovo – súbor sa zaregistruje sám (`import.meta.glob` v `src/textures/index.ts`; súbory začínajúce `_` sa ignorujú). Poradie určuje názov súboru.

Zoznam ID parametrov nesmie kolidovať s `bg, ink1, ink2, hi, dirt, res, so, seed, phase, cycles, anim, motion` a nepoužívaj GLSL rezervované slová (`active`, `sample`, `filter`…).

## Vývojové nástroje

`dev/sheet.html` vykreslí všetky textúry do jednej tabuľky a nahlási chyby shaderov (`node scripts/sheet.mjs out.png`, vyžaduje beží `npm run dev` a Playwright).

## Poznámky

- Video: `MediaRecorder` nahráva v reálnom čase v plnom rozlíšení; MP4 sa uprednostní, ak ho prehliadač vie (Safari/iOS). Tlačidlo „MP4 pre Instagram“ prekóduje do H.264 cez ffmpeg.wasm (jadro sa stiahne z CDN pri prvom použití).
- Na iPhone sa PNG/JPG/video odosielajú cez systémové „Zdieľať“ (uloženie do Fotiek).
- Dáta (palety, presety, posledná scéna) sú v `localStorage`.
