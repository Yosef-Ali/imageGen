# ImageGen

ImageGen is a web application that allows users to generate images using OpenAI's DALL-E 3 API. The application provides a simple, intuitive interface for entering prompts, customizing generation parameters, and viewing generated images.

## Features

- Generate images using OpenAI's DALL-E 3 API
- Customize image parameters (size, quality, style)
- View history of generated images
- Download generated images
- Responsive design for mobile and desktop
- Dark and light mode support

## Tech Stack

- Next.js 14+
- TypeScript
- TailwindCSS
- Shadcn UI
- Zustand for state management
- OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/image-gen.git
cd image-gen
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to the `.env.local` file (optional, can also be set in the app):

```
OPENAI_API_KEY=your_api_key_here
```

5. Start the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a prompt in the text area
2. Customize generation parameters if desired
3. Click "Generate Image"
4. View the generated image in the gallery
5. Click on an image to view details and download

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for the DALL-E 3 API
- [Next.js](https://nextjs.org/) for the React framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for UI components
