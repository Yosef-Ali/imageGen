# Image Generation App Requirements

I would like to create an image generation app called "ImageGen" that uses OpenAI's image generation API.

## Core Features
- Integration with OpenAI's DALL-E 3 API for image generation
- User-friendly interface with a prompt input and a gallery of generated images
- Ability to customize generation parameters (size, quality, style)
- Save and download generated images
- View history of previously generated images
- Responsive design for mobile and desktop

## Tech Stack
- Next.js 14+ with App Router
- TypeScript for type safety
- TailwindCSS for styling
- Shadcn UI for components
- Lucide Icons for icons
- React Hook Form with Zod for form validation
- Zustand for state management
- Local storage for saving images and history

## User Interface
- Clean, minimalist design
- Dark and light mode support
- Main page with a prompt input field and generation options
- Gallery view of generated images in a responsive grid
- Image detail view with download option and generation parameters
- Settings page for API key management

## Image Generation Options
- Size options: 1024x1024, 1024x1792, 1792x1024
- Quality options: standard, hd
- Style options: vivid, natural
- Number of images to generate (1-4)

## Storage
- Save OpenAI API key in local storage (encrypted)
- Save generated images and prompts in local storage
- Option to clear history and saved images

## Additional Features
- Loading indicators during image generation
- Error handling for API failures
- Copy image prompt functionality
- Regenerate with same prompt option
- Share images via URL (if possible)

## Non-Requirements
- User authentication (single-user app)
- Server-side storage (all client-side)
- Payment processing
