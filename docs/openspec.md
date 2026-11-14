# Spec first, with OpenSpec

Behaviour is defined before it is built. The rule and its reason are in
[CLAUDE.md](../CLAUDE.md#spec-first); this file is the workflow.

## The five specs

`openspec/specs/`: `contestant-roster`, `contest-clock`, `title-award`, `arena-board`, and
`session-persistence`. The last describes the single-device version and is partly out of date.
`openspec/changes/faxing-rooms/specs/session-persistence` is the delta that started to replace
it. Reconciling the two is open work.

## A change

A change lives in `openspec/changes/<id>/`: a proposal, delta specs under
`specs/<capability>/spec.md` written as ADDED / MODIFIED / REMOVED requirements with scenarios,
a design, and a task list.

```bash
openspec validate --specs --strict        # the five main specs
openspec validate <change-id> --strict    # one change
openspec status --change <change-id>      # which artifacts are still missing
openspec list                             # open changes
```

Two validator behaviours that cost time:

- A requirement's `SHALL` or `MUST` must be on the **line immediately after** the
  `### Requirement:` header.
- Scenarios need **exactly four** hashes (`####`). Three fails silently.

## When to skip the spec

Skip it for a one-off: a typo, a comment, a dependency bump, an obvious bug with one correct
behaviour. Say in one line that you skipped it and why that is safe.

Spec it when the change alters observable behaviour, touches a capability's contract, has more
than one reasonable design, or spans more than a couple of files. A visual change is observable
behaviour too.

## Findings

When a change produces a measurement or a failed experiment, record it in the change's
`findings.md` as it happens, including the results that killed the idea.
