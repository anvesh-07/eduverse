# **App Name**: EduVerse

## Core Features:

- User Authentication: Implement Firebase Authentication for user sign-up and login using Email/Password and Google Sign-In.
- Content Upload: Allow authenticated users to upload educational content with title, description, file (text, images, videos, PDFs).
- AI Content Moderation Tool: Use Gemini API via a Next.js API route to validate if the uploaded content is educational.
- AI Auto-Tagging Tool: Use Gemini API via a Next.js API route to generate 3-5 relevant educational tags for approved content.
- Home Feed: Display a feed of free content based on the topics/tags the user follows. For new users, show a generic feed of popular content.
- Topic Following: Allow users to browse all available tags and follow/unfollow them to curate their content feed.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4), reflecting the seriousness and intelligence associated with education.
- Background color: Very dark gray (#282A3A), providing contrast to emphasize content and provide better UX in low light environments.
- Accent color: Desaturated purple (#B19CD9), analogous to blue, for secondary interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif font known for its clean and modern appearance that will ensure legibility and a professional aesthetic for the app's content.
- Use consistent and minimalist icons for navigation and actions, maintaining a clean and modern look.
- Utilize a modern, clean, and intuitive layout with a sidebar for navigation and a main content area for displaying educational content. Use Shadcn for UI components.