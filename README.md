# Open Source AI Adoption Project

100% browser based video transcription.

## Our Mission

Our goal is to grow the adoption of open source AI in products. We believe that the AI revolution should be in the hands of the people, not just large corporations. By making AI accessible and understandable, we hope to empower individuals to create their own AI-powered solutions. We aim to expand on this demonstration and to build other products using open source AI.

## Demo Video

[![Watch the video](https://vimeo.com/890829724)](https://vimeo.com/890829724)

This project is a demonstration of how open source AI can be integrated into products, empowering individuals to harness the power of the AI revolution.

## Key Features

- **Model Execution with Web Workers**: We use transformer.js to run a model inside a web worker. This ensures that the main thread is not blocked, providing a smooth user experience even when the model is processing data.

- **Rapid Audio Extraction**: Our application uses vanilla JavaScript's OfflineAudioContext to rapidly extract audio data. This eliminates the need for complex libraries like FFmpeg, making our codebase simpler and more maintainable.

- **Simple, Informative Interface**: We believe in the power of simplicity. Our interface is visually simple yet informative, clearly explaining what our application does and how to use it.

Next steps:

- [ ] allow users loading a more powerful model
- [ ] test different languages
- [ ] burn the subtitles on the video

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

## Authors:

- Toby Solutions: [GitHub Profile](https://github.com/tobySolutions)
- Gui Bibeau: [GitHub Profile](https://github.com/GuiBibeau)
