// src/ai/flows/content-moderation.ts
'use server';

/**
 * @fileOverview A content moderation AI agent.
 *
 * - validateContent - A function that validates if the uploaded content is educational.
 * - ValidateContentInput - The input type for the validateContent function.
 * - ValidateContentOutput - The return type for the validateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateContentInputSchema = z.object({
  title: z.string().describe('The title of the content.'),
  description: z.string().describe('A detailed description of the content.'),
  fileType: z.string().describe('The type of the uploaded file (text, image, video, PDF).'),
});
export type ValidateContentInput = z.infer<typeof ValidateContentInputSchema>;

const ValidateContentOutputSchema = z.object({
  isEducational: z.boolean().describe('Whether the content is educational or not.'),
  reason: z.string().describe('The reason for the content being educational or not.'),
});
export type ValidateContentOutput = z.infer<typeof ValidateContentOutputSchema>;

export async function validateContent(input: ValidateContentInput): Promise<ValidateContentOutput> {
  return validateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateContentPrompt',
  input: {schema: ValidateContentInputSchema},
  output: {schema: ValidateContentOutputSchema},
  prompt: `You are an AI content moderator specializing in educational content.

You will use the provided information to determine if the content is educational in nature.

Consider the following:
- Does the content provide information or instruction on a particular subject?
- Is the content intended to educate or inform the viewer/reader?
- Is the content objective and fact-based, or is it primarily entertainment?

Title: {{{title}}}
Description: {{{description}}}
File Type: {{{fileType}}}

Based on this, set the isEducational output field to true or false. Also, provide a brief explanation for your decision in the reason field.
`,
});

const validateContentFlow = ai.defineFlow(
  {
    name: 'validateContentFlow',
    inputSchema: ValidateContentInputSchema,
    outputSchema: ValidateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
