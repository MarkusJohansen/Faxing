## ADDED Requirements

### Requirement: A person is the entries that share a person key
The person key of a chronicle entry SHALL be its name trimmed, with runs of spaces collapsed and
lower-cased, after the alias record has replaced the name by the full name it stands for. Two
entries SHALL be the same person exactly when their person keys are equal. The number of people SHALL
be the number of distinct person keys across the chronicle.

#### Scenario: A repeated name is one person
- **WHEN** one Faxing lists "Eva Eksempel" and another lists "eva eksempel"
- **THEN** the two entries have the same person key

#### Scenario: A first name in the alias record
- **WHEN** the alias record maps "Tora" to "Tora Prøvesen" and an entry is named "Tora"
- **THEN** it is the same person as an entry named "Tora Prøvesen"

#### Scenario: A first name nobody resolved
- **WHEN** an entry is named "Qux", no alias maps it, and "Qux Foo" and "Qux Bar" also exist
- **THEN** it is its own person

### Requirement: The alias record is data and writes nothing back
The alias record SHALL be kept in `src/data/people.json`. No source file SHALL name a person. The
record SHALL be applied when the chronicle is read, and SHALL NOT change a stored event: names,
times, titles and finishes stay as they were recorded.

#### Scenario: The chronicle is untouched
- **WHEN** the alias record maps "Tora" to "Tora Prøvesen"
- **THEN** the stored entry still reads "Tora", and no request rewrites the event

### Requirement: The home screen counts people, not entries
The "Navn i krøniken" figure on the home screen SHALL be the number of people, and SHALL NOT be the
number of entries across all Faxings.

#### Scenario: Someone who came three times
- **WHEN** one person is listed in three Faxings
- **THEN** they add one to the figure, not three

### Requirement: A results page shows the full name
On a Faxing's results page, an entry whose name the alias record maps SHALL be shown under the full
name, with the spelling the record wrote shown beside it. An entry the record does not map SHALL be
shown as it is. The Faxepave's editor SHALL show and edit the name as stored.

#### Scenario: A first name is shown in full
- **WHEN** the entry is "Tora" and the alias record maps it to "Tora Prøvesen"
- **THEN** the row reads "Tora Prøvesen" with "skrevet «Tora»" beside it

#### Scenario: A name the record does not map
- **WHEN** the entry is "Kåre Knekt" and the record has no alias for it
- **THEN** the row reads "Kåre Knekt" with nothing beside it
