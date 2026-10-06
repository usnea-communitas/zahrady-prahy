# Product

<!-- impeccable:product-schema 1 -->

> Návrh připravený z toho, co Martin o projektu řekl, a z dokumentace v repozitáři. Zkontroluj a oprav, co nesedí.

## Platform

web

## Users

Lidé, kteří chtějí sami objevovat pražské komunitní zahrady a městskou přírodu. Organizované procházky ani workshopy nebyly zvoleny jako cíl; atlas slouží samostatnému prozkoumávání.

## Product Purpose

Ilustrovaný interaktivní atlas 13 pražských komunitních zahrad. Projekt spolku Usnea communitas, z. s.

## Positioning

Pohádkově ilustrovaná mapa Prahy, ve které je každá praktická informace o návštěvě doložená zdrojem a datem ověření. Chybějící údaje se poctivě ukazují jako chybějící, nikdy se nedomýšlejí.

## Operating Context

- Primárně počítač; telefonní rozložení existuje (`app/mobile.css`, opravy 2026-09-23).
- Mapa, vyhledávání bez ohledu na diakritiku, filtry kategorií, sdílitelné odkazy `?zahrada=`.
- Zvuková krajina se spouští jen tlačítkem s notou, nikdy automaticky.

## Capabilities and Constraints

- Zpětná vazba a sběr osobních údajů jsou na Martinovo přání vypnuté. Formulář návrhů zůstává poctivě nedostupný, bez falešného „odesláno“.
- Bez databáze a bez předplatného.
- Katalog: `lib/gardens.ts`. Praktické údaje o návštěvě: `lib/garden-visits.ts`, každý se zdrojem a datem kontroly. `not-found` znamená „pravidelný rozvrh nenalezen“, ne „zavřeno“.
- Pozice zahrad na ilustraci (`artPositions`) jsou redakční umístění, ne navigace. Pro cestu slouží odkazy na skutečnou mapu.
- Ovládání klávesnicí, návrat fokusu a hlášení přes `aria-live` jsou implementované a mají zůstat zachované.

## Brand Commitments

- Stávající vizuální systém je zdokumentovaný v `design/README.md` a `design/structured-*`. Ilustrovaná Praha, 13 ilustrací zahrad, hudba a animace se zachovávají.
- Ilustrace jsou umělecké ztvárnění, ne dokumentární fotografie, a tak se i označují.
- Patička si drží průhlednost, o kterou Martin požádal.

## Evidence on Hand

- Ilustrace a mapy v `public/`, provenience a prompty v `docs/visual-generation-prompts.md`.
- Ověřené údaje o návštěvách (datum kontroly 6. 9. 2026).
- Žádné reference, citace návštěvníků ani statistiky neexistují; nevymýšlet je.

## Product Principles

1. Pravdivost před plností: radši přiznaný chybějící údaj než odhad.
2. Ilustrace je zážitek, ne navigační podklad.
3. Klid: nic se nespouští samo, nic nesbírá data.
