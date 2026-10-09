# Prompt: 20 nápadov na mobilné generátory obrázkov a videí

Skopíruj do Claude:

---

Si kreatívny riaditeľ a produktový dizajnér. Vymysli **20 nápadov na jednostránkové webové aplikácie** (fungujú v Safari na iPhone, bez servera, bez účtu), ktoré generujú **obrázky a krátke video slučky** pre sociálne siete (Instagram story/post/reel, TikTok). Referenčný štýl: moderná klubová / techno / drum & bass vizuálna kultúra, print a risograf, neotribal, glitch spravený s vkusom, brutalistická geometria, jemné svetlo a zrno. **Nie** zastaralé veci (kruhy, lens flare, neón, lebky, oheň, bodkovaný halftone, "3D chrome 2010").

Existujúca aplikácia BG Lab už robí: pozadia z WebGL2 shaderov, paletu 5 farieb, vrstvu špiny (zrno, xerox, light leak…), export PNG/JPG/video slučky. Tvoje nápady majú byť **iné aplikácie**, nie ďalšie textúry do nej.

Pre každý nápad uveď:
1. **Názov** (krátky, nie generický)
2. **Čo robí** – jedna veta, čo užívateľ dostane
3. **Ako sa ovláda na telefóne** – max 3 hlavné ovládacie prvky (gestá, slidery, tlačidlo "náhodne")
4. **Vstup** – žiadny / vlastná fotka / text / mikrofón / pohyb telefónu (gyroskop) / kamera
5. **Výstup** – PNG, slučka MP4, alebo oboje; formáty (1080×1920, 1080×1350…)
6. **Technika** – WebGL shader / Canvas 2D / WebAudio / WebGPU / ffmpeg.wasm, a či ide plynulo na telefóne
7. **Prečo vyzerá moderne** – čo ho odlišuje od lacných generátorov
8. **Náročnosť** 1–5 a **čas na prototyp** (hodiny)

Pokry tieto kategórie (aspoň 2 nápady z každej):
- **Z vlastnej fotky:** efekty na nahratú fotku (xerox kópia, riso 2 farby, glitch posun, pixel sort, termovízia, displacement)
- **Typografia bez fontu klišé:** text ako tvar (deformácia, rozpad, stroboskop) – bez vodoznakov
- **Reaktívne na zvuk:** vizuál reaguje na mikrofón alebo nahratú skladbu (spektrogram, tvary), export videa so zvukom
- **Pohyb a senzory:** vizuál reaguje na naklonenie telefónu alebo dotyk
- **Generatívne vzory / tapety:** neotribal, mramor, topografia, mesh gradient, rastre bez bodiek
- **Plagáty a obaly:** generátor plagátu / obalu singlu / event flyeru zo šablón + náhodné rozloženie
- **Video slučky:** krátke seamless slučky 2–10 s pre story pozadia, prechody, overlaye so zrnom
- **Nástroje okolo:** generátor paliet z fotky, kontrola safe zón, hromadný export sady formátov

Pravidlá:
- Všetko beží v prehliadači, offline po načítaní, dáta v localStorage.
- Slovenské UI, tmavé minimalistické rozhranie, veľké ovládacie prvky pre palec.
- Každý nápad musí mať "Náhodne" a "Remix" tlačidlo.
- Žiadne umelé "AI obrázky" – iba procedurálna grafika a spracovanie užívateľových vstupov.

Na konci:
- zoraď nápady podľa **pomeru dopad / náročnosť** a označ top 5 na postavenie ako prvé,
- navrhni, ktoré by sa dali zlúčiť do jednej aplikácie "štúdio" so spoločnou paletou a exportom,
- pre top 3 napíš hotový **zadávací prompt** (v štýle zadania pre BG Lab), ktorý môžem rovno poslať Claude Code.
