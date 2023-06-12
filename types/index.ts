export interface Prompt {
  id: string;
  text: string;
  title: string;
  exampleInput?: string;
  exampleOutput?: string;
}

export interface PromptWithAuthor extends Prompt {
  author: {
    id: string;
  };
}
