## ADDED Requirements

### Requirement: The reigning Faxing is the most recent official one in the chronicle
The system SHALL treat as reigning the official Faxing with the latest date in the
chronicle. Unofficial Faxinger SHALL never reign, however recent they are. When two
official Faxinger share the latest date, the one the chronicle lists first SHALL reign.

#### Scenario: The latest official Faxing reigns
- **WHEN** the chronicle holds official Faxinger dated in March and in July
- **THEN** the July Faxing reigns

#### Scenario: A later unofficial Faxing does not unseat the crowns
- **WHEN** the latest Faxing in the chronicle is unofficial and an earlier one is official
- **THEN** the earlier official Faxing reigns

#### Scenario: A new official Faxing takes the crowns
- **WHEN** an official room is closed and its Faxing enters the chronicle with the latest date
- **THEN** that Faxing reigns once the chronicle is next loaded

### Requirement: Only the crowns of the reigning Faxing are honoured
The system SHALL honour each contestant of the reigning Faxing whose recorded title is
`Faxekonge`, `Faxedronning` or `Faxemonark`, in that order. Contestants titled
`Faxeridder` or `Hestemann`, and contestants with no title, SHALL NOT be honoured. The
titles honoured SHALL be the ones recorded in the chronicle; the tribute SHALL NOT re-derive
or alter them.

#### Scenario: Crowns are honoured in a fixed order
- **WHEN** the reigning Faxing crowned a `Faxedronning`, a `Faxekonge` and a `Faxemonark`
- **THEN** they are honoured in the order `Faxekonge`, `Faxedronning`, `Faxemonark`

#### Scenario: Knights are not honoured
- **WHEN** the reigning Faxing has a `Faxekonge` and two `Faxeridder`
- **THEN** only the `Faxekonge` is honoured

#### Scenario: A missing crown is simply absent
- **WHEN** the reigning Faxing crowned a `Faxekonge` but no woman finished in time
- **THEN** the `Faxekonge` is honoured and no `Faxedronning` entry is shown

#### Scenario: A correction in the chronicle is reflected
- **WHEN** Faxepave edits the reigning Faxing so that a different contestant holds `Faxekonge`
- **THEN** the tribute honours the contestant the chronicle now records

### Requirement: Each honoured crown shows its title, holder and time
The system SHALL show, for each honoured crown, the title, the holder's name and the
holder's finishing time as minutes and seconds (`m:ss`), measured from the start of the
contest. The tribute SHALL also name the reigning Faxing and its date.

#### Scenario: A crown is shown with its time
- **WHEN** Ola won `Faxekonge` at «Sommerfaxing» on 12 July, finishing 14 minutes 32 seconds after the start
- **THEN** the tribute names «Sommerfaxing» and 12 July, and shows `Faxekonge`, Ola and `14:32`

### Requirement: The tribute appears on the home screen
The system SHALL show the tribute on the home screen, after the stats and before the rooms
panel. It SHALL NOT appear on any other screen.

#### Scenario: The tribute is on the home screen
- **WHEN** a reigning Faxing has at least one crown and the home screen is open
- **THEN** the tribute is shown between the stats and the rooms panel

### Requirement: No crown means no tribute
The system SHALL NOT show the tribute when the chronicle holds no official Faxing, when
the reigning Faxing honours no crown, or before the chronicle has loaded. Failing to load
the chronicle SHALL NOT break the home screen.

#### Scenario: No official Faxing yet
- **WHEN** the chronicle holds only unofficial Faxinger
- **THEN** no tribute is shown

#### Scenario: The reigning Faxing crowned nobody
- **WHEN** every contestant at the reigning Faxing is `Hestemann` or `Faxeridder`
- **THEN** no tribute is shown, and no earlier Faxing's crowns are shown instead

#### Scenario: The chronicle cannot be loaded
- **WHEN** loading the chronicle fails
- **THEN** the home screen renders without the tribute
