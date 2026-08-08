# API Coverage — Phase 01 (Theme & Site Shell)

> Full coverage by default. Opt-outs are explicit, reasoned decisions.

Detector false-positive note: the `api-coverage` gate matched "wire" + "API" against Plan 01-02's explicit prohibition text ("MUST NOT wire any header/footer/CTA element to a real network call, analytics beacon, or external API this phase"), not an actual integration. This phase has zero external API/SDK/service surface — it's local theming and a static shell (`next-themes`, `@repo/ui`, no `fetch`/`axios`/network calls anywhere in the phase's files, confirmed by the verifier's grep in `01-VERIFICATION.md`).

| capability | decision | reason |
|---|---|---|
| external-network-api | OPT-OUT | No external API/SDK/service integrated this phase — mock-data-only milestone per PROJECT.md/CLAUDE.md constraints; Contacts/Demo backend integration is explicitly deferred to v2 (INTEG-01/INTEG-02). |
