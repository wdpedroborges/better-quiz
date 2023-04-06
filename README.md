# Better Quiz
## A model for quizes in React.js

---

Better Quiz is a quiz with the objective of being a model for future quizzes. Like any other quiz, it is characterized by its flexibility. However, Better Quiz goes further, allowing the question database to be separated by categories. Besides that, instead of having a bunch of alternatives for the user to click, Better Quiz only receives typed answers, and in order to make sure that the user typed it correctly, there's a bar of suggestions.

---

![badge](https://img.shields.io/github/watchers/wdpedroborges/better-quiz?style=social)
![badge](https://img.shields.io/github/stars/wdpedroborges/better-quiz?style=social)
![badge](https://img.shields.io/github/license/wdpedroborges/better-quiz)
![badge](https://img.shields.io/badge/powered%20by-vite-blue)
![badge](https://img.shields.io/badge/powered%20by-react.js-blue)
![badge](https://img.shields.io/badge/powered%20by-typescript-blue)
![badge](https://img.shields.io/badge/powered%20by-sass.js-blue)

---

## Live Demo

[Click here to see it]((wdpedroborges.github.io/better-quiz))

## Features

- Filter questions by categories
- Suggestions
- Configurable timer
- Points counting
- Performance calculation
- Record storage in Local Storage
- Processes text, images, and audio

## Tech

- Vite
- React.js
- Typescript
- Sass

## Installation

Clone the repository:

```bash
git clone https://github.com/wdpedroborges/better-quiz
```

For production:

```sh
cd better-quiz
npm install
npm run dev
```

Debug in Typescript:

```bash
tsc --noEmit --watch
```

Build:

```bash
npm run build
```

## Deploy

- Add to vite.config.js:

```bash
base: "/<repo>/"
```

- Then:

```bash
npm install gh-pages --save-dev
```

- Add to package.json

```bash
 "homepage": "https://<username>.github.io/<repo>/",
  ...
  "scripts": {
...
"build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
...
```

## License

This project is licensed under the MIT License. Please see the LICENSE file for more details.