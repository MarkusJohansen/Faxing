## ADDED Requirements

### Requirement: The chronology marks where den andre orden begins

The archive SHALL draw the dashed founding line, labelled with the day den andre orden was
founded, between the Faxinger of the first order and those of the second. The line SHALL come from
the same constant the crown lines use. The mark SHALL stand above the newest Faxing of the first
order, and SHALL NOT be drawn when the listed Faxinger are all on one side of that day.

#### Scenario: A chronicle that spans the founding

- **WHEN** the archive lists Faxinger from before and after 10 October 2024
- **THEN** the dashed line is drawn between them, above the newest Faxing of the first order, and it names the day

#### Scenario: A chronicle of the second order alone

- **WHEN** every listed Faxing is on or after the founding
- **THEN** no founding line is drawn

#### Scenario: A chronicle of the first order alone

- **WHEN** every listed Faxing is before the founding
- **THEN** no founding line is drawn

#### Scenario: A Faxing on the founding day

- **WHEN** a Faxing was held on 10 October 2024
- **THEN** it is drawn on the second order's side of the line, so the line stands below it

#### Scenario: The two views agree

- **WHEN** the same chronicle is shown in the succession and in the archive
- **THEN** both marks name the same day, because both read one constant
