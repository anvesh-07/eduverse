# EduVerse: Your Universe of AI-Curated Learning

**EduVerse** is an intelligent, AI-powered web platform for sharing, discovering, and monetizing high-quality educational content. The core philosophy is to create a curated learning environment where content discovery is driven by interest in **topics**, not by following individual creators.

The platform uses Google's Gemini AI as a "gatekeeper" and "librarian," ensuring all materials are educational and organizing them automatically for easy access.

---

## Core Features

*   **🤖 AI Content Validation & Tagging**
    All user uploads (text, images, videos, PDFs) are automatically analyzed by an AI to verify their educational value. The AI also generates relevant topic tags, which are combined with tags provided by the creator.

*   **🔭 Advanced Topic-Based Discovery**
    Users build a personalized learning feed by **following topics**, not people. The main feed is split into two sections:
    1.  **For You**: A personalized feed showing content from followed topics.
    2.  **Trending**: A public feed displaying the most popular content on the platform.
    A dedicated "Topics" page allows users to search, sort by popularity, and discover new subjects to follow.

*   **🔗 Scalable Bidirectional Linking**
    Using a robust Firestore database structure, every piece of content is linked to its relevant topics, and every topic is linked back to all its related content. This allows users to seamlessly explore a topic by viewing all associated materials on a dedicated topic page.

*   **💰 Creator Monetization (Planned)**
    Content creators have the option to put their premium content behind a paywall. The platform is designed for integration with **Stripe** to handle secure one-time payments for accessing this locked content.

*   **🗂️ Personal Content Dashboard**
    When a user signs up, a personal profile document is automatically created. Users can manage all their uploaded content from a dedicated "My Content" section in the sidebar, which gives them options to **edit**, **archive** (hide from public), or **permanently delete** their contributions.

---

## Technical Architecture

*   **Frontend**: Next.js (React)
*   **Backend & Database**: Firebase (Authentication, Firestore, Storage)
*   **AI Engine**: Google Gemini API via Genkit
*   **UI/Styling**: shadcn/ui, Tailwind CSS
*   **Payments**: Stripe API (Planned)

---

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   A Firebase project with Authentication, Firestore, and Storage enabled.
*   A Google AI API Key for Gemini.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of your project and add the necessary Firebase and Google AI credentials.

```env
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK (for server-side operations)
# Ensure the private key is enclosed in quotes and newlines are represented as \n
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google AI (Genkit)
GEMINI_API_KEY=
```

### Running the Development Server

To run the application locally, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:9003`.

---

## Deployment

This application is ready to be deployed on platforms like Vercel or Firebase App Hosting.

When deploying, ensure that you have configured all the necessary environment variables in your hosting provider's settings, just as you did for your local `.env` file. This is crucial for the application to connect to Firebase and the Gemini API in production.
