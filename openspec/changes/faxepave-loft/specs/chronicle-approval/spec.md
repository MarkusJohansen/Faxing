## ADDED Requirements

### Requirement: Closing a room files the Faxing for approval

A closed room SHALL produce a chronicle entry that the Faxepave has not yet approved, and the
entry SHALL NOT appear in the chronicle until the Faxepave approves it. Closing SHALL still
derive the titles on the server from the recorded finishes, and SHALL store the room's title,
official flag and start instant with the entry. A closed room SHALL accept no further changes.

#### Scenario: A host closes the contest

- **WHEN** the host closes a started room with a finisher
- **THEN** an entry is written for it, awaiting approval, and it is not in the chronicle

#### Scenario: Closing before the hour has run

- **WHEN** the host closes the room while one contestant has finished
- **THEN** the awaiting entry records that contestant as `Hestemann`, and no title is awarded
  before the hour

#### Scenario: The closed room is closed to action

- **WHEN** any action other than a read is sent against a closed room
- **THEN** it is refused with `409 Rommet er allereie stengt.`, as before

### Requirement: The chronicle lists approved Faxinger only

The chronicle list SHALL contain only entries the Faxepave has approved. The home screen's
counts of Faxinger and of names, and the reigning `Faxemonark`, SHALL be derived from that list,
so an entry awaiting approval or a refused one cannot crown anyone.

#### Scenario: A waiting Faxing is not counted

- **WHEN** a room closes and the home screen is opened
- **THEN** the counts of Faxinger, of names, and the reigning tribute are unchanged

#### Scenario: Approval enters the chronicle

- **WHEN** the Faxepave approves the entry
- **THEN** the next read of the chronicle lists it, and the counts include it

### Requirement: The outcome of a closed room stays readable to its own devices

A device holding the link of a closed room's entry SHALL be able to read that entry's results
whether or not it is approved, so that the room's devices are not stranded on the close. Such an
entry SHALL NOT be listed.

#### Scenario: The room closes on a device

- **WHEN** any device in the room sees the closed room
- **THEN** it opens the results page for the entry, with the titles derived at close, and the
  page says the Faxing awaits the Faxepave

#### Scenario: The link of a refused entry

- **WHEN** a device without a Faxepave session asks for the entry of a refused Faxing by its id
- **THEN** the answer is `404` and the device is told the Faxing was refused

### Requirement: Only the Faxepave accepts or denies a Faxing

The server SHALL refuse an approval or a denial without a valid Faxepave session. Approving SHALL
add the entry to the chronicle. Denying SHALL remove it from the chronicle and SHALL keep the
entry, so that a mistaken denial can be restored and nothing recorded at close is destroyed.

#### Scenario: A device without the password decides

- **WHEN** an approval or a denial arrives without a Faxepave session
- **THEN** it is refused with `401 Berre Faxepaven kan avgjere kva som kjem i krøniken.`

#### Scenario: Approving

- **WHEN** the Faxepave approves an entry awaiting approval
- **THEN** the entry is in the chronicle and no longer waits

#### Scenario: Denying

- **WHEN** the Faxepave denies an entry
- **THEN** it stops waiting, it is not in the chronicle, and it is still on the loft, refused

#### Scenario: Restoring a refusal

- **WHEN** the Faxepave restores a refused entry
- **THEN** it is in the chronicle again

### Requirement: A Faxing filed by hand is approved as written

A chronicle entry the Faxepave creates SHALL be in the chronicle at once, because writing it is
the decision. An entry filed by hand SHALL be editable and deniable like any other.

#### Scenario: Filing an old Faxing

- **WHEN** the Faxepave files an old Faxing from the loft
- **THEN** the chronicle lists it without a further approval, and it opens for attendees to be
  added
