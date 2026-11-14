## ADDED Requirements

### Requirement: An attendant who holds an honour looks different
An entry in the lobby's list of enlisted people, and a suggestion, SHALL be marked when its person
holds an honour. The honours SHALL be `saint`, `pope` and `champion`. A person SHALL be a champion when the
chronicle records them with the title Faxekonge, Faxedronning or Erkekonge in an official
Faxing; a title from an unofficial Faxing SHALL NOT count. The pope
and the saints SHALL be the people the order's lore names. A person holding several SHALL show
one, chosen in the order saint, pope, champion. The mark SHALL include a text label, not colour alone.
Entries without an honour SHALL look as they do now.

#### Scenario: A past champion enlists
- **WHEN** a person recorded as Faxekonge or Faxedronning in an earlier official Faxing is in the room
- **THEN** their entry carries the champion mark and its label

#### Scenario: A crown from an unofficial night
- **WHEN** a person was crowned only at an unofficial Faxing
- **THEN** their entry is unmarked

#### Scenario: A champion who is also a saint
- **WHEN** a person is both recorded as Faxekonge at an official Faxing and named a saint by the lore
- **THEN** their entry shows the saint mark only

#### Scenario: The saint is Markus Johansen
- **WHEN** the chronicle holds an entry "Markus" linked to Markus Johansen
- **THEN** the entry is marked as a saint and is offered as "Markus Johansen"

#### Scenario: St. Are is the man in the first Faxeting
- **WHEN** the chronicle holds "Are Tommerås" from the first Faxeting, linked to Are Tømmerås
- **THEN** the entry is marked as a saint and is offered as "Are Tømmerås"

#### Scenario: A bare Markus is not guessed
- **WHEN** someone enlists as "Markus" with no link
- **THEN** their entry is unmarked

#### Scenario: Nobody special
- **WHEN** a person has never been crowned and the lore does not name them
- **THEN** their entry is unmarked

#### Scenario: A suggestion shows the honour
- **WHEN** a suggested person holds an honour
- **THEN** the suggestion carries the same mark
