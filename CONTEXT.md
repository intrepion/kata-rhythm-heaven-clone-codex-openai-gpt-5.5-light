# Rhythm Heaven-Inspired Timing Game

This context defines the gameplay language for a browser rhythm game inspired by Rhythm Heaven's precise one-button microgames and absurd music-video presentation.

## Language

**Microgame**:
A short self-contained rhythm challenge built around one repeated musical task and one clear player action.
_Avoid_: Level, stage, song

**Remix**:
A medley that recombines previously learned microgame patterns into one continuous performance.
_Avoid_: Playlist, campaign level

**Primary Action**:
The player's main input, performed with Space, click, or tap, and judged against the beat.
_Avoid_: Button press, command, control

**Timing Cue**:
An audio or visual signal that teaches when the player should perform the Primary Action.
_Avoid_: Note, prompt, marker

**Call-and-Response**:
A rhythm pattern where the Microgame presents a Timing Cue phrase and the player echoes it with the Primary Action.
_Avoid_: Simon says, repeat-after-me, cue sequence

**Stamp Shift**:
The first Microgame, where an office worker stamps forms in response to rhythmic cues.
_Avoid_: Office level, stamp game, paperwork stage

**Ace**:
A judgment for an input that lands inside the strictest timing window.
_Avoid_: Perfect

**Good**:
A judgment for an input that lands close enough to count but not tightly enough for an Ace.
_Avoid_: Okay, hit

**Early**:
A judgment for an input that arrives before the intended beat window.
_Avoid_: Premature, fast

**Late**:
A judgment for an input that arrives after the intended beat window.
_Avoid_: Slow, delayed

**Miss**:
A judgment for a missing or badly timed input that fails the rhythm task.
_Avoid_: Fail, bad

**Practice**:
A guided playable introduction that teaches the current Microgame before scored play begins.
_Avoid_: Tutorial, onboarding

**Rank**:
The final performance result assigned after a scored Microgame.
_Avoid_: Grade, rating

**Try Again**:
The lowest Rank, assigned when the player does not yet keep the Microgame's rhythm.
_Avoid_: Failure, game over

**Almost**:
A Rank for a performance that understands the pattern but misses too many beats for a clean pass.
_Avoid_: Close, weak pass

**Solid**:
A Rank for a competent performance with mostly correct timing.
_Avoid_: Pass, clear

**Superb**:
The highest Rank, assigned for a highly accurate performance across the scored Microgame.
_Avoid_: Perfect rank, excellent
