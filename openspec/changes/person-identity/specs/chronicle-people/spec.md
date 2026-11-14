## ADDED Requirements

### Requirement: A person is the entries that share a person key
The person key of a chronicle entry SHALL be its `personId` when it has one, and otherwise its
name trimmed, with runs of spaces collapsed, and lower-cased. Two entries SHALL be the same person
exactly when their person keys are equal. The number of people SHALL be the number of distinct
person keys across the chronicle.

#### Scenario: A repeated name is one person
- **WHEN** one Faxing lists "Sivert Vårum" and another lists "Sivert vårum"
- **THEN** the two entries have the same person key

#### Scenario: A first name linked to a full name
- **WHEN** an entry named "Arne" carries `personId` "arne hildrum" and another is named
  "Arne Hildrum"
- **THEN** they are the same person, and "Arne" is still the name shown for the first entry

#### Scenario: A first name alone is not a guess
- **WHEN** an entry named "Henrik" carries no `personId` while "Henrik Moe" and "Henrik Jung" exist
- **THEN** it is its own person

### Requirement: The home screen counts people, not entries
The "Navn i krøniken" figure on the home screen SHALL be the number of people, as defined above,
and SHALL NOT be the number of entries across all Faxings.

#### Scenario: Someone who came three times
- **WHEN** one person is listed in three Faxings
- **THEN** they add one to the figure, not three

### Requirement: Linking never rewrites the record
Linking entries to a person SHALL set only `personId`. A name, time, title, gender or finish SHALL
NOT be changed by it, and an entry that already carries a different `personId` SHALL be reported
and left alone.

#### Scenario: The link is added beside the name
- **WHEN** the correction run links "Magnus" to "Magnus Strømseng"
- **THEN** the entry still reads "Magnus", and gains `personId` "magnus strømseng"

#### Scenario: A link to nobody is refused
- **WHEN** the alias record names a full name that no chronicle entry carries and the lore does
  not give in full
- **THEN** the run stops before filing anything and names the alias, so a typo in the record
  cannot create a person who was never there

### Requirement: Renaming an entry drops its link
When the name of a chronicle entry is changed, the entry SHALL lose its `personId`, because the link
described the old name.

#### Scenario: A linked entry is renamed
- **WHEN** the Faxepave changes the name of an entry linked to "Arne Hildrum" from "Arne" to "Ådne"
- **THEN** the entry has no `personId` and is the person its new name says

### Requirement: The correction run is by hand and additive
`npm run link:people` SHALL read the chronicle from the server named on its command line and report
each entry it would link. Without `--write` it SHALL change nothing. With `--write` it SHALL log in
as Faxepave and `PUT` only the events that have a change.

#### Scenario: Re-running changes nothing
- **WHEN** the run is repeated after a successful `--write`
- **THEN** it reports no entry to link and sends no request
