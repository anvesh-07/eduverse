'use server';

/**
 * @fileOverview Automatically generates relevant educational tags for content.
 *
 * - generateTags - A function that generates tags for given content.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTagsInputSchema = z.object({
  title: z.string().describe('The title of the content.'),
  description: z.string().describe('A detailed description of the content.'),
  contentType: z.enum(['text', 'image', 'video', 'pdf']).describe('The type of the content.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 3-5 relevant educational tags for the content.'),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return generateTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {schema: GenerateTagsInputSchema},
  output: {schema: GenerateTagsOutputSchema},
  prompt: `You are an expert in education content tagging.

  Given the following content details, generate 3-5 relevant educational tags that will help users discover this content.
  The tags should be concise and accurately reflect the content's educational focus.

  Title: {{{title}}}
  Description: {{{description}}}
  Content Type: {{{contentType}}}

  Return ONLY an array of strings.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  }
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
