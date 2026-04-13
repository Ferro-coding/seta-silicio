# Seta & Silicio — TODO

## Da sistemare

- [x] **Scroll lento** — scelta voluta per feeling premium/cinematico. Nessuna modifica necessaria.

- [x] **Horizontal scroll (itinerari) si blocca e riparte** — risolto: rebuild completo con approccio sticky (no pin). La sezione usa `position:sticky` + altezza dinamica, ScrollTrigger con `scrub:true` senza pin. Zero conflitti Lenis.

## Versioni

- `seta-silicio-backup/` — v1 (prima versione senior)
- `seta-silicio-v2/` — v2 (parallax, progress bar, dividers)
- `seta-silicio/` — versione attiva (v2+, palette e spacing raffinati)

## Esperimento scroll-cinema

- `scroll-cinema/` — test image sequence (250 frame Terra che gira)
- `scroll-cinema/index-video.html` — test con video nativo (meno fluido del previsto)
- Risultato: i frame funzionano, il video seek dei browser non è abbastanza fluido
- Per il futuro: servono video più lunghi e più frame per smoothness migliore
