'use server';

/**
 * @fileOverview Renders the markdown description of Docker images retrieved from the Docker Hub API in a nicely formatted way.
 *
 * - renderMarkdownDescription - A function that renders the markdown description.
 * - RenderMarkdownDescriptionInput - The input type for the renderMarkdownDescription function.
 * - RenderMarkdownDescriptionOutput - The return type for the renderMarkdownDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RenderMarkdownDescriptionInputSchema = z.object({
  markdown: z.string().describe('The markdown description of the Docker image.'),
});
export type RenderMarkdownDescriptionInput = z.infer<typeof RenderMarkdownDescriptionInputSchema>;

const RenderMarkdownDescriptionOutputSchema = z.object({
  renderedHtml: z.string().describe('The rendered HTML of the markdown description.'),
});
export type RenderMarkdownDescriptionOutput = z.infer<typeof RenderMarkdownDescriptionOutputSchema>;

export async function renderMarkdownDescription(
  input: RenderMarkdownDescriptionInput
): Promise<RenderMarkdownDescriptionOutput> {
  return renderMarkdownDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'renderMarkdownDescriptionPrompt',
  input: {schema: RenderMarkdownDescriptionInputSchema},
  output: {schema: RenderMarkdownDescriptionOutputSchema},
  prompt: `You are an expert in converting markdown to HTML.

  Convert the following markdown to HTML:

  {{{markdown}}}`,
});

const renderMarkdownDescriptionFlow = ai.defineFlow(
  {
    name: 'renderMarkdownDescriptionFlow',
    inputSchema: RenderMarkdownDescriptionInputSchema,
    outputSchema: RenderMarkdownDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
