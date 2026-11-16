## ADDED Requirements

### Requirement: The loft is offered only to the Faxepave

The interface SHALL offer the loft while this device holds a Faxepave session, and SHALL NOT
offer it otherwise. Everything the loft shows SHALL come from requests that need that session.

#### Scenario: A guest's navigation

- **WHEN** the Faxepave password has not been given on this device
- **THEN** the navigation has no way to the loft

#### Scenario: After signing in

- **WHEN** the device signs in to the Faxepave
- **THEN** the navigation offers the loft, and it reports how many Faxinger wait

#### Scenario: After signing out

- **WHEN** the device signs out
- **THEN** the way to the loft is gone and what it had loaded is no longer shown

### Requirement: The loft says what waits and what was refused

The loft SHALL list every Faxing awaiting approval with its date, title, whether it was official,
and how many participants it recorded, and SHALL state how many wait. It SHALL list the refused
Faxinger with a way to restore each. It SHALL say when nothing waits. A Faxing awaiting approval
SHALL be openable from the loft, and a refused one SHALL be readable there by the Faxepave.

#### Scenario: Nothing waits

- **WHEN** the Faxepave opens the loft with no Faxing awaiting approval
- **THEN** the loft says that none wait, and does not show an empty frame

#### Scenario: A Faxing waits

- **WHEN** a room has closed since the last visit
- **THEN** the loft lists that Faxing with its date, title and participant count

#### Scenario: Opening a waiting Faxing

- **WHEN** the Faxepave opens a Faxing that awaits approval
- **THEN** its results page is shown, with the same decision available there

### Requirement: One press decides a Faxing

The loft SHALL approve or deny a Faxing in one press, without a confirmation step, because a
denial is kept and can be restored. Deleting a Faxing SHALL stay a separate action that is
confirmed.

#### Scenario: Approving from the loft

- **WHEN** the Faxepave presses approve on a waiting Faxing
- **THEN** it leaves the queue, and the chronicle lists it

#### Scenario: Denying from the loft

- **WHEN** the Faxepave presses deny on a waiting Faxing
- **THEN** it leaves the queue, it is listed as refused, and the chronicle does not list it

#### Scenario: Deleting

- **WHEN** the Faxepave asks to delete a Faxing
- **THEN** the deletion is preceded by a confirmation, as before

### Requirement: An old Faxing is filed from the loft

The Faxepave SHALL file an old Faxing from a form in the loft that takes a name, a date and
whether it was official, and SHALL NOT be asked for those through browser prompt dialogs. The
filed Faxing SHALL appear in the chronicle at once and SHALL open for its attendees to be added.

#### Scenario: Filing an old Faxing

- **WHEN** the Faxepave fills the form with a name, a date and the official flag
- **THEN** the Faxing is in the chronicle, and its page opens for editing

#### Scenario: A form without a name

- **WHEN** the form is submitted with an empty name
- **THEN** the server refuses it and the loft shows why, in Norwegian
