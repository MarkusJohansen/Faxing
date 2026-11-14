## REMOVED Requirements

### Requirement: Persistence is per-device and per-browser profile, and nothing else
**Reason**: The contest is now held by the server in a room, so that several devices share one board and a host's dead phone does not lose it.
**Migration**: Covered by `faxing-rooms` ("Every device shows the same board", "The host token survives a reload").

### Requirement: A tournament in progress is restored on load
**Reason**: The device no longer holds the tournament; it holds only a room token.
**Migration**: Covered by `faxing-rooms` ("The host token survives a reload").
