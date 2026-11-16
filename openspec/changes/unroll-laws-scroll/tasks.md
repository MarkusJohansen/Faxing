## 1. The unrolling
- [x] 1.1 `src/components/TenBuds.tsx`: the foot roll and the seal in one carriage, `laws-foot`
- [x] 1.2 `src/App.css`: the carriage laid over the scroll; `laws-unroll`, `laws-descend`,
      `laws-unwind`, `laws-seal-hang` and `laws-seal-sway` inside the
      `prefers-reduced-motion: no-preference` block

## 2. Before it is called done
- [x] 2.1 `npm run typecheck`, `npm run check:rules`, `npm run build` exit 0
- [x] 2.2 `openspec validate unroll-laws-scroll --strict` and `openspec validate --specs --strict` pass
- [x] 2.3 Still frames of the unrolling looked at in headless Chrome at 390 and 1280 pixels wide,
      and the open scroll with reduced motion asked for
- [ ] 2.4 The unrolling watched moving, on a real phone (Safari) and a desktop: the pace and the
      seal's swing are a guess until somebody sees them
