export type Chat = {
    id: number;
    title: string;
};

export type Message = {
    id: number;
    chat_id: number;
    role: string;
    content: string;
    sequence: number;
    model?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type InputType =
    | 'question'
    | 'instructions'
    | 'draft text'
    | 'outline'
    | 'code'
    | 'data'
    | 'image prompt'
    | 'error message'
    | 'reflection notes'
    | 'research topic'
    | 'citation request'
    | 'mixed';

export type OutputType =
    | 'explanation'
    | 'summary'
    | 'rewrite'
    | 'ideas'
    | 'outline'
    | 'code'
    | 'debugging help'
    | 'examples'
    | 'feedback'
    | 'grammar correction'
    | 'structure advice'
    | 'citations'
    | 'plan'
    | 'mixed';

export type AssistantRole =
    | 'tutor'
    | 'editor'
    | 'brainstorm partner'
    | 'coding assistant'
    | 'research assistant'
    | 'formatter'
    | 'reviewer';

export type Confidence = 'High' | 'Medium' | 'Low';

export type UseCase = {
    label: string;
    evidence: string;
    input_type: InputType[];
    output_type: OutputType[];
    assistant_role: AssistantRole;
    confidence: Confidence;
};

export type UseLog =
    | {
          total_use_cases: number;
          use_cases: UseCase[];
          summary_statement: string;
      }
    | undefined;
