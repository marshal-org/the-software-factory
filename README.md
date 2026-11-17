# The Software Factory

A community guide to the road from AI-assisted coding to a software factory, at [thesoftwarefactory.site](https://thesoftwarefactory.site).

- **Lights Out** (`public/lights-out/`): a simulator of a delivery line. Find the constraint, automate it, send every human home.
- **Manifesto** (`src/pages/manifesto.md`)
- **The Playbook** (`src/pages/playbook/`): one Markdown file per play
- **Journey** (`src/pages/journey.md`): stages and the constraint that tends to appear at each
- **Stories** (`src/pages/stories/`): field notes from teams

## Run it

```
npm install
npm run dev
```

The site is built with [Astro](https://astro.build) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## The simulator model

All numbers live in `public/lights-out/model.js`: station capacities, what each optimization multiplies, incident probabilities. They are estimates. If your experience says a number is wrong, change it in a pull request and say what you saw.

## Credits

The GitHub mark in the navigation is GitHub's own icon from [Octicons](https://github.com/primer/octicons) (MIT).

## License

Code is MIT (see `LICENSE`). Written content is CC BY 4.0.

Started by [Ofir Makmal](https://il.linkedin.com/in/ofirmakmal), founder of [Marshal](https://marshal.codes) and [Runlease](https://runlease.online). He has led engineering at several startups as VP Engineering and CTO, and spent years as a consultant helping dozens of engineering teams tune both their software and the way they deliver it. Contributions welcome, see `CONTRIBUTING.md`.
