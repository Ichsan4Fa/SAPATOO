# SAPATOO homepage — working notes

## Reading of the brief
A shoe store homepage (sneakers, running, boots, dress shoes; men, women, kids). No brand assets, no product
photography, no address yet. Static HTML/CSS/JS in this folder. Redesign of the earlier canvas mock-up, whose
tells were: pill eyebrows ("New season drop", "Just landed"), tiny tracked caps, 1.5px outlined pills, rows of
identical cards, a decorative circle, colourful-but-arbitrary tiles.

## Inventory (things only SAPATOO has)
1. The name: Portuguese *sapato*, "shoe" — the word that became Indonesian/Malay *sepatu*.
2. The extra O: two O's, a pair.
3. The route of the word: Portuguese traders in Malacca from 1511, the Malay world.
4. Other Portuguese words in everyday Indonesian: pesta (festa), Minggu (domingo), jendela (janela),
   bendera (bandeira), roda, bola, sekolah (escola), tinta, serdadu (soldado), mandor (mandador),
   kemeja (camisa), dansa (dança), nona (dona), pesiar (passear), kereta (carreta), boneka (boneca).
5. Its printed things: the swing tag on every pair, the receipt, the price list, the shoebox label.
6. Its numbers: sizes EU 24–47, prices in rupiah (sample), delivery days (sample).
7. Its trade's tools: the last (the size made solid), the eyelet, laces, the gum sole.
8. Its world in pictures: a wall of wooden lasts, a shoemaker on Java in 1946, the 1635 Portuguese plan of Malacca.

## The argument
1. SAPATOO is a shoe store for men, women and kids.            → the swing tag, large (hero)
2. This season's pair is the Minggu sneaker, in three colours.  → the drawn shoe, colour tabs, order
3. Sixteen pairs, every one with its price.                      → the price list sheet on the wall of lasts
4. You can buy the right size online.                            → the size slip: type your foot, get your size
5. The name is the word for shoe, and the pairs carry its story. → letter + Malacca plan + Java shoemaker
6. Delivery, exchanges and payment are answered.                 → questions as reading text
7. Order.                                                         → one word is the button
8. Come and try them on.                                          → footer, cropped name

## Direction
`page-is-the-object` (seed 1896439910). Chosen over contact-sheet (needs many photographs we do not have) and
split-stage (category-generic): a shop already prints its own objects — tag, receipt, price list — and a tag can
carry the name's meaning.

## The idea
On this page, **SAPATOO's own name — sapato, the Portuguese word that became Indonesia's sepatu — becomes the swing
tag hung on every pair**: the hero is the tag printed with the word, and every pair on the price list is named after
another Portuguese word that made the same journey (Minggu, Pesta, Sekolah…).
Competitor test: another shoe store can't carry this sentence — it's built on this name.

## The live thing
The size slip: type (or step) your foot length, the receipt prints EU / UK / US and an "order in this size" line
that fills the order email. Plain fallback: a printed default and a size chart table.

## Critique

```
ROUND 1
Seen in one second: the paper swing tag reading "SAPATOO shoe store" on black
Idea: sapato -> sepatu is the tag; every pair is named after another Portuguese loanword
Live thing: the size slip (foot length -> EU/UK/US, order link in that size)
Layout words: hero=object / showcase=split / prices=sheet-on-photo / size=split-slip / name=letter+plates / faq=text-columns / cta=word-band / footer=statement
Scores: design 7.5 · usability 8 · creativity 8 · content 8 -> overall 7.8
Caps applied: none
Top three problems:
1. Phone tag: detail row leaves a diamond hanging at the end of line one (mobile-fold) -> stack on phones.
2. Name section desktop: plates small against black ground (desktop-page-02) -> Java plate lowered to the letter's middle.
3. Interactions unproven -> clicked through: colour tabs, stepper, typed input (comma decimals failed, fixed), out-of-range sizes (now say so), order links.

ROUND 2 (final, 0 FAIL / 0 WARN at 1440, 768, 390)
Seen in one second: the swing tag
Scores: design 7.5 · usability 8 · creativity 8 · content 8 -> overall 7.8
Caps applied: none
Still short:
1. The shoes are drawings; product photographs would lift design the most.
2. Desktop name section: black ground below the Malacca plate is a soft hole.
3. "Why SAPATOO" breaks over two lines inside the 440px letter measure on desktop.
Also fixed this round: tablet "Order" band clipped its sentence under the scooped corner; tablet copyright line wrapped word by word.
```

## Deviations
- Hero field is the ink colour, not a soft colour: the palette flips whole sections to near-black, and the paper tag
  needs a contrasting ground. The action button is brass (accent on the action).
- About blueprint has no heading; house rule wins, so the letter gets one.
- The dealt "Objects" photographs (coffee cup, clock, typewriter…) are not used: none belongs to this subject.
- Signature move: the curtain footer was built first, but it keeps the footer heading pinned under the whole
  page, which the inspector fails as covered text. Replaced by the footer name rising into its crop as the
  footer enters.
