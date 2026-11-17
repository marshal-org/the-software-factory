# Contributing

Everything on the site is a file in this repository. A pull request is the way to add something or to disagree.

## Change a number in the simulator

Edit `public/lights-out/model.js`. In the pull request, say what you observed in a real team that supports the new number.

## Add an optimization card

Add an entry to the `UP` list in `public/lights-out/model.js`:

- `st`: the station it belongs to
- `kind`: `cap` (raises capacity), `quality` (cuts rework) or `enabler` (unlocks or protects)
- `cost`: in $k for a ten-engineer team; it scales with team size
- `need`: ids of cards that must be installed first
- `nm`, `d`: name and one or two plain sentences

Then apply its effect in `caps()`.

## Edit or add a play

Each play is a file in `src/pages/playbook/`. A play has to hold its weight: it comes from something that actually happened on a line, and it ends with a move someone can make. Keep the five sections: the scene, the play, smells, first move, and how it shows up in Lights Out. If you add or reorder plays, update `src/plays.js` too.

## Add a story

Add a Markdown file to `src/pages/stories/` with the same front matter as the existing story (title, summary, author, date). Answer: where was work piling up, what did you change, what moved, what became the constraint afterwards.

## Style

Plain language. Short sentences. Numbers where you have them. No vendor pitches: name tools when they are part of the story, and name more than one when alternatives exist.
