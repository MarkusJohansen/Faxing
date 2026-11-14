## ADDED Requirements

### Requirement: The lobby suggests people already in the chronicle
While a name of at least two characters is typed into the lobby's name field, the lobby SHALL list
at most five people from the chronicle whose name resembles it, best match first. A person SHALL be
listed once however many Faxings they attended, under their full name. Matching SHALL ignore case
and diacritics, SHALL accept a name typed in part, and SHALL tolerate one mistyped letter in a
word of five letters or more.

#### Scenario: A first name suggests the full name
- **WHEN** "Tora" is typed and the chronicle holds "Tora Prøvesen"
- **THEN** "Tora Prøvesen" is suggested

#### Scenario: A typo still finds the person
- **WHEN** "Ase Eksemple" is typed and the chronicle holds "Åse Eksempel"
- **THEN** "Åse Eksempel" is suggested

#### Scenario: A short name is not blurred
- **WHEN** "Tora" is typed and the chronicle holds "Tara Test" and "Tore Test"
- **THEN** neither is suggested, because a word of four letters may not carry a slip

#### Scenario: Two people share a first name
- **WHEN** "Kira" is typed and the chronicle holds "Kira Lie Test" and "Kira Schaug-Test"
- **THEN** both are suggested and neither is chosen for the person

#### Scenario: One person is listed once
- **WHEN** a person attended three Faxinger, once written "Tora" and mapped by the alias record to
  "Tora Prøvesen"
- **THEN** they appear once, as "Tora Prøvesen"

#### Scenario: The exact name needs no suggestion
- **WHEN** the typed name equals a suggested name exactly
- **THEN** that name is not offered back

### Requirement: Choosing a suggestion fills in the person
Choosing a suggestion SHALL set the name field to that person's full name and the gender to the one
last recorded for them. The person SHALL remain free to change either before submitting. A name
that matches no suggestion SHALL still be accepted as typed.

#### Scenario: A suggestion is chosen
- **WHEN** "Tora" is typed and "Tora Prøvesen" is chosen
- **THEN** the name field reads "Tora Prøvesen" and the gender is the one recorded for them

#### Scenario: A new name is typed
- **WHEN** a name matching nobody is submitted
- **THEN** the person is enlisted under it

### Requirement: A suggestion already in the room is shown as taken
A suggestion whose name already belongs to a member of this room SHALL be shown but SHALL NOT be
choosable, because a room admits a name once.

#### Scenario: The person is already in
- **WHEN** "Tora Prøvesen" is in the room and "Tora" is typed
- **THEN** "Tora Prøvesen" is listed as already enlisted and cannot be chosen
