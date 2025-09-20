import { config } from 'dotenv';
config();

import '@/ai/flows/content-moderation.ts';
import '@/ai/flows/auto-tagging.ts';