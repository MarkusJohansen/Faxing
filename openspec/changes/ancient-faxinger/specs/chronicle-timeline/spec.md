## ADDED Requirements

### Requirement: The Faxinger of den første orden are drawn as ancient

The archive SHALL draw a Faxing held before den andre orden was founded as ancient: an older
ground, a tarnished brass bevel and aged text, decided from the same constant the crown lines
read. An ancient official Faxing SHALL keep the lighter ground that marks an official night. The
archive's legend SHALL name the reading. The run of Faxinger SHALL NOT be divided by a line.

#### Scenario: A night before the founding

- **WHEN** the archive lists a Faxing held before 10 October 2024
- **THEN** its card is drawn as ancient, in the older stone and the tarnished brass

#### Scenario: An official night of the first order

- **WHEN** an ancient Faxing is official
- **THEN** its card keeps the lighter ground of an official night, in the ancient tones, so both readings are visible

#### Scenario: A night after the founding

- **WHEN** a Faxing was held on 10 October 2024 or later
- **THEN** its card is drawn in the ordinary tones, because that night belongs to den andre orden

#### Scenario: The legend

- **WHEN** the archive is shown
- **THEN** its legend names «Den første orden» beside the marks it already explains

#### Scenario: The road stays whole

- **WHEN** the archive holds Faxinger from both sides of the founding
- **THEN** no line or divider is drawn between them, and the chronology remains one run through the years

#### Scenario: One constant

- **WHEN** the archive and the succession are shown together
- **THEN** both read the founding from `SECOND_ORDER_FOUNDED`, so they cannot disagree about which night is ancient
