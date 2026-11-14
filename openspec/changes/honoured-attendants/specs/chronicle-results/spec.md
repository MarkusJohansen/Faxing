## ADDED Requirements

### Requirement: A Faxing's results mark honoured attendants as of that Faxing
Each row in the results of a Faxing in the chronicle SHALL carry the mark of its person's honour, as
the honours are defined for the lobby, worked out as of that Faxing's date. A person SHALL be a
champion on that page only when the chronicle records them with the title Faxekonge, Faxedronning or
Erkekonge at an official Faxing held strictly before it. A crown won on the same day, or later, SHALL
NOT count. The pope and the saints SHALL be marked on every page, whatever its date. A person
holding several honours SHALL show the highest. The mark SHALL include a text label, not colour alone.

#### Scenario: The night someone won
- **WHEN** a person is recorded as Erkekonge at the first official Faxing
- **THEN** their row on that page is not marked as a champion

#### Scenario: A later Faxing
- **WHEN** the same person attends a Faxing held after that one
- **THEN** their row on that page carries the champion mark

#### Scenario: A saint on every page
- **WHEN** a person the lore names a saint appears in the earliest Faxing
- **THEN** their row carries the saint mark, although the lore's canonisation came later

#### Scenario: Two Faxinger on one day
- **WHEN** a crown is won at one Faxing and a second Faxing is held on the same day
- **THEN** the second page does not mark the winner as a past champion

#### Scenario: A first-name entry reaches its person
- **WHEN** an entry is written "Tora" and the alias record maps it to a person the lore names a saint
- **THEN** the row carries the saint mark, because honours follow the person and not the spelling

#### Scenario: The Faxepave changes the date
- **WHEN** a Faxepave edits a Faxing's date in the editor
- **THEN** the champion marks on that page are worked out again from the new date
