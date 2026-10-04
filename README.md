# Stamp Shift

Stamp Shift is a static browser rhythm microgame inspired by Rhythm Heaven's one-button call-and-response timing. An office worker stamps forms after nonsense vocal cues, then earns a final Rank.

## Play

Open `index.html` directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Controls:

- `Space` to stamp
- Click or tap to stamp

The current slice runs Practice, moves into a Scored Run, shows immediate stamp feedback, and ends on a Rank screen with restart.
