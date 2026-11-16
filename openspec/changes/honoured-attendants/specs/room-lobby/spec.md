## ADDED Requirements

### Requirement: An attendant who holds an honour looks different
An entry in the lobby's list of enlisted people, and a suggestion, SHALL be marked when its person
holds an honour. The honours SHALL be `founder`, `saint`, `pope` and `champion`. A person SHALL be a champion when the
chronicle records them with the title Faxekonge, Faxedronning or Erkekonge in an official
Faxing; a title from an unofficial Faxing SHALL NOT count. The founders, the pope
and the saints SHALL be the people the order's lore names, kept as data in `src/data/people.json`.
The founders SHALL be the members of Eldsterådet, who made the game itself, and their mark SHALL stand
above every other: a person holding several SHALL show one, chosen in the order founder, saint, pope,
champion. The founders' mark SHALL differ from the saint's in shape as well as in colour — a framed
plaque rather than a bare star — because their standing is the one no Faxing can grant. The mark SHALL
include a text label, not colour alone, and SHALL stand out from an unmarked row: a tint across the
row and a light of its own (a slow halo for a saint, a gold shimmer for the pope, an ember for a
champion). Motion SHALL stop when the viewer asks for reduced motion, and the mark SHALL read the same
without it. Entries without an honour SHALL look as they do now.

#### Scenario: A past champion enlists
- **WHEN** a person recorded as Faxekonge or Faxedronning in an earlier official Faxing is in the room
- **THEN** their entry carries the champion mark and its label

#### Scenario: A crown from an unofficial night
- **WHEN** a person was crowned only at an unofficial Faxing
- **THEN** their entry is unmarked

#### Scenario: A founder of the game
- **WHEN** a person in the room is one of Eldsterådet
- **THEN** their entry carries the founder mark, framed and in the ancient brass, and not the saint's

#### Scenario: A founder who was also crowned
- **WHEN** a member of Eldsterådet is recorded as Faxekonge at an official Faxing
- **THEN** their entry shows the founder mark, because no crown reaches above the game's makers

#### Scenario: A champion who is also a saint
- **WHEN** a person is both recorded as Faxekonge at an official Faxing and named a saint by the lore
- **THEN** their entry shows the saint mark only

#### Scenario: A saint recorded by an alias
- **WHEN** the chronicle holds an entry the alias record maps to a person the lore names a saint
- **THEN** the entry is marked as a saint and is offered under the full name

#### Scenario: Nobody special
- **WHEN** a person has never been crowned and the lore does not name them
- **THEN** their entry is unmarked

#### Scenario: A suggestion shows the honour
- **WHEN** a suggested person holds an honour
- **THEN** the suggestion carries the same mark

#### Scenario: Reduced motion
- **WHEN** the viewer's system asks for reduced motion
- **THEN** the marks keep their tint, edge, glow and label, and nothing animates
