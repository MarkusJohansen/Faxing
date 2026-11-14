# De gamle faxingene

Five Faxings were recorded outside this application. They survive only as chat messages, and
the chronicle — the one place a Faxing is documented — could not reach them: the only door into
it is closing a room.

This file is the record. The messages are reproduced as they were written, in Norwegian, with
their nicknames and their typos. `scripts/history/legacy-events.json` encodes the same results
for the seeder, and `npm run seed:history` files them in `faxing_events`. Where this file and
the fixture disagree, this file is the record and the fixture has a defect.

The notes after each message say what the encoding had to decide. Nothing in the encoding is a
new result: a time, a name or a title comes from the message, or it is left empty.

---

## 18 September 2026 — Faxetidene fra Fredagen (official)

Posted by Gleb Rychkov (Discord). The text carries no date of its own: it says the times are
from "fredagen", and 18 September 2026 is a Friday, so the session ran on Friday 18 September
2026.

```
Vær hilset mine faxeundersåtter :faxe-kongelig:
Her kommer faxetidene fra fredagen
Velkommen til mine nye riddere :faxe:
:crossed_swords: :faxe: Gloria Faxem! :faxe::crossed_swords:



Eirik Andreassen, 1:16 Faxekonge♛
Tone-Lill Aarsheim, 4:16 Faxedronning♛

3.    Kasper Schaug-Pettersen 6:25
4.    Thomas Barth, 6:56
5.    Tias Bugge, 7:19
6.    Emmanuel Mulinda, 13:09
7.    Tobi Haugrønning, 16:01
8.    Sebastian Smith, 18:43
9.    Brage Baugerød, 19:37
10.    Nicolai Skjerve, 19:44
11.    Gleb Rychkov, 24:02
12.    Arne Hildrum, 26:00
13.    Marius Brun, 27:14
14.    Karl Theodor Ladegård Beck, 28:08
15.    Ola Vassbotn, 28:50
16.    Andrej Lazic, 29:54
17.    Nikolai Hoel, 32:15
18.    Cecilie Uttian, 33:40
19.    Sepanta Ganjei, 34:36
20.    Jonas Pettersen, 35:25
21.    Christian Aas, 37:00
22.    Jesper Lauvås, 37:49
23.    Eirik Øy, 38:48
24.    Nilas Bull, 43:17
25.    Erlend Strøm, 44:04
26.    Rasmus Thorkildsen, 44:33
27.    Emil Steen, 44:43
28.    Dagbjört Reynisdóttir, 45:36
29.    Johannes Koren Hage, 45:44
30.    Jakub Zimny, 46:21
31.    Birk Berg, 47:17
32.    Kristian Gjertsen, 47:30
33.    Sopika Visvalingam, 47:43
34.    Jonatan Halperin, 49:47
35.    Anne Cecilie Nilsen, 50:14
36.    William Fagerstrøm, 50:50
37.    Rojus Ratautas, 51:01
38.    Henrik Jung, 52:41
39.    Marco Josefsen, 54:45
40.    Jacob Austdal, 55:06
41.    Ådne Børresen, 55:55
42.    Bjørn Pollen, 56:45
43.    Live Dyrland, 57:55
44.    Oskar Molvær, 58:45
45.    Lara Jacobsen, 59:30



Hestemenn/kvinner:
    Leander Kongsrud
    Mathea Kalley
    Peter Johnsen
    Hallvard Olsen
    Mila Spasova
    Ingvild Sandven
    Linn Grotnes (edited)
```

**Encoded as** `legacy-2026-09-18`, official. The message states the two crowns and greets the
rest as "mine nye riddere", so ranks 3–45 are stored as `Faxeridder`. The seven who did not
finish are stored as `Hestemann` with `disqualified` true and no time. The heading
"Hestemenn/kvinner" is the record's own; the application has one title for it.

---

## 10 September 2025 — Faxing (official)

The message's own heading is "Faxing"; no other name is given for the session.

```
Faxing
0:56,66 Jennings 
1:26 Markus 
1:50 Tristan 
3:07 Toby
8:56 Martin
14:05 Marius
16:14 Henrik Nordvik 
22:30 Tor Tveito
24:50 Kristian numme
26:23 Sofie 
29:12 Daniel
33:44 Sander
34:55 Ouren
35:05 Mathea
36:54 Eline
37:42 Sivert vårum 
39:40 Ole
39:50 Arne 
39:54 William Reitan
41:47 Tobias Knudsen 
44:33 Gleb Rychkov
44:40 Ludvig Hattestad 
46:01 Johannes
50:16 Sofie venninna til Eline
52:31 Halvis (kvartvar)
55:57 Henry 
56:21 Iver 
56:29 Willy 
56:55 Helle
57:25 Solvår
57:40 Vilde
59:50 Nicolay Bennett Rennemo
Hestemann
Andrej (er klart det suger)
```

**Encoded as** `legacy-2025-09-10`, official. The message names no titles, so none are stored:
no crown, no knighthood, and no invented `Faxeridder`. Andrej is a `Hestemann`; the aside "(er
klart det suger)" is kept here and not in his name.

The list gives `34:55 Ouren`, by surname only. The organizer supplied the full name, so the
fixture stores `Magnus Ouren`; this file keeps what was posted.

Jennings' time is `0:56,66`. The chronicle stores 56 660 ms and the table shows `0:56`, because
the archive displays whole seconds. The hundredths are in the record and in the fixture.

---

## 15 April 2025 — Det første Faxetinget (official)

The record is a skaldekvad, written after the contest. The poem calls the session "det første
Faxetinget".

```
Skaldekvadet

01:23 
I løpet av timens første halvannet minutt ble Scott Jennings erkekonge, med kongsnavnet Fax den første av hans navn, ferdig med sine edle dråper.

(Ukjent tidspunkt)
Prinsen (jarl), tidligere Faxekaiser William den første, kjempet tappert i det første Faxetinget. Men nye tider introduserer nye utfordrere. Beseirer av Faxeerkekonge Scott den første av hans navn, ble William prins, av det første Faxetinget.

16:27 
Etter å ha fullført sin boks, hever Martin Rustad et spørsmål for tinget, hvorpå det avgjøres i et pavekonsil at den andre som tømmer sin Faxe skal ha tittelen kronprins og den tredje skal ha tittelen prins. Martin blir dermed prins av faxe ordenen og William blir den første kronprins

24:00 Ådne svendsrrud
26:15 Henrik Nordvik
27:06 Sivert Vårum 
34:54 - Thomas Nguyen
35:10 - Are Tommerås
41:27 - Magnus Strømseng
46:17 - Lars Magne Stangeland
49:49 - Sondre Stokke
51:18 - Kasper Lie Nordbø
52:55 - Kirisan Premakanth
59:50 - Jasper Solberg
```

**Encoded as** `legacy-2025-04-15`, official: Scott Jennings `Erkekonge` at 1:23, William
`Kronprins` with no time, Martin Rustad `Prins` at 16:27, and the eleven remaining finishers
with no title, because the poem awards none.

The three titles are the record's, not the application's: today's rules award `Faxekonge`,
`Faxedronning` and `Faxeridder`, and the archive shows `Erkekonge`, `Kronprins` and `Prins` as
written. The poem's own account of the rule change — the assembly inventing kronprins and
prins during the contest — is why later Faxings use the current titles.

The poem gives William no time, and the encoding does not invent one. His row reads `Tid
ukjent`, and the table keeps the poem's order rather than ranking around the gap.

---

## 10 October 2026 — Bekk (unofficial)

Posted by William Fagerstrøm (Discord). The message carries no date; Markus supplied 10 October
2026, and that is the date in the chronicle.

```
O ærede faxeriddere, nye faxeriddere just dropped :faxe-ordenen: 

Peter - 22:45
Vegard - 24:30
Magnus byrkj - 29:30
Patrick - 32:43 (edru)
Fredrik - 44:40
William Fagerstrøm - 53:19
Ådne  Svendstrud - 53:58
Henrik Moe - 54:30
Aleksander Westergaard Karlsen - 59:15
```

**Encoded as** `legacy-2026-10-10`, **unofficial**. The message announces the nine as "nye
faxeriddere", so all nine are stored as `Faxeridder`. Patrick's "(edru)" is the record's aside,
kept here and not in his name.

---

## 4 November 2025 — Kontor til Kontor med Tihlde, Abakus og Online styrer (unofficial)

Supplied by Markus on 14 November 2026, with the title and the date. **This is not the original
message.** It is a table worked out from it, already sorted by time, and the message itself is
not in this file. Until it is added, the table is the record for this Faxing.

```
 #   Time   Name                          Group    Done
 1   5:56   Marius Brun                   Online
 2   6:37   Sander Rom Skofsrud           TIHLDE   ✓
 3  22:56   Johannes                      Online
 4  26:01   Torjus Østensen               Abakus   ✓
 5  26:32   Laurits Rossebø               Abakus
 6  29:37   Ingrid Marie Nikolaisen       TIHLDE   ✓
 7  34:48   Torkil Thomassen              TIHLDE
 8  34:50   Daniel Evensen                TIHLDE
 9  36:56   Oskar Larsen                  Abakus   ✓
10  39:31   Ailin Tinglum                 Online
11  39:48   Evine                         TIHLDE   ✓
12  40:02   Nathalie Graidy Andreassen    TIHLDE   ✓
13  40:02   Peder Brennum                 Abakus
14  41:41   Live                          Online
15  43:13   Ola                           Online
16  44:00   Iver
17  44:47   Erik
18  45:30   Andrej
19  49:05   Synne                         Online   ✓
20  56:00   Brage Andreas (endru faxing)  Online
21  56:28   Sara Alvestad Kjerstad        TIHLDE
22  57:53   Oda                                    ✓
23  59:17   Mathias

Hestemann: Eman Hashami
```

**Encoded as** `legacy-2025-11-04`, **unofficial**. The table names no title except the
Hestemann, so no finisher carries one. Three things in it were worked out, not read, and are
unconfirmed:

- **The times were converted** from a countdown, as 60:00 minus the value written. Sara's 56:28
  comes from a written 3:32; if that was already an elapsed time, she finished first.
- **Brage's 56:00** comes from "4 min", read as 4:00 left on the clock.
- **Sara's group** was written "Thildekå" and read as TIHLDE.

The chronicle has nowhere to put the group or the Done column, so they are kept only here; what
Done marks is not recorded. Brage's "(endru faxing)" is the record's aside, kept here and not in
his name. Every gender in this event is read off the name, because the organizer has supplied
none; Ailin, Evine, Live and Eman are the least certain.

---

## How the encoding decided

- **Durations, not instants.** None of the records gives a clock time, only a duration. The
  imported rows store the duration in `elapsed` and leave `finishedAt` empty; the archive reads
  the duration. Nothing fabricates an instant, and a duration is never accumulated.
- **Times.** `m:ss` and `m:ss,cc` are converted once, to milliseconds inside the hour. Nothing
  outside the hour is accepted.
- **Titles.** Stored exactly as the record states them, never recomputed. Where a record names
  no title, the title is empty. `Hestemann` is stored with `disqualified` true, as the live
  flow does.
- **Names.** Verbatim, including `Sofie venninna til Eline`, `Halvis (kvartvar)`, `Magnus byrkj`,
  `Ådne svendsrrud`, `Sivert vårum` and `Kristian numme`. A nickname is what the record says;
  correcting one would make the fixture disagree with this file. The one exception is `Ouren`,
  which was written by surname only: the organizer supplied Magnus Ouren, and the fixture stores
  the full name.
- **Gender.** The messages never state one, and a name does not settle it. The fixture stores the
  gender the organizer supplied instead of one read off the list: Kvartvar (written
  `Halvis (kvartvar)`, the parenthesis is his first name), Magnus Ouren, Sepanta Ganjei and
  Kirisan Premakanth are male; Sopika Visvalingam is female. No imported title depends on this:
  every title above is transcribed.
- **Order.** The contestant order is the record's order, including the Hestemenn after the
  finishers. The archive keeps that order whenever a finisher has no duration.

## Filing them

```bash
npm run seed:history -- --dry-run                    # validate the record, contact nothing
npm run seed:history -- https://faxing.example       # show what would be filed there
FAXEPAVE_PASSWORD=… npm run seed:history -- https://faxing.example --write
```

The command is run once, by hand, against a running server, and files through the Faxepave's
`POST /api/events`. Without `--write` it only reports.

Filing only adds. An id already in the chronicle is left alone, so running it twice changes
nothing and never overwrites a correction made in the interface. An event is held back while the
chronicle already has another event on the same day: decide which of the two stays, remove the
other in the interface, and run it again. Nothing runs it automatically, so an event a Faxepave
deletes stays deleted; running the command again would offer to file it again.
