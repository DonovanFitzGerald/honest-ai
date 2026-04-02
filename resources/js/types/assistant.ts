export type ISODateString = string;

export type ModelKey = string;

export type MessageRole = 'user' | 'assistant' | 'system';

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

export type Chat = {
    id: number;
    title: string;
    created_at: ISODateString;
    updated_at: ISODateString;
};

export type Message = {
    id: number;
    chat_id: number;
    role: MessageRole | string;
    content: string;
    tokens?: number | null;
    sequence: number;
    model?: ModelKey | null;
    raw_json?: unknown | null;
    created_at: ISODateString;
    updated_at: ISODateString;
};

export type UseLogCase = {
    id: number;
    use_log_id: number;
    position: number;
    label: string;
    evidence: string;
    input_type: InputType[];
    output_type: OutputType[];
    assistant_role: AssistantRole;
    confidence: Confidence;
    created_at: ISODateString;
    updated_at: ISODateString;
};

export type ParsedUseLogCase = Pick<
    UseLogCase,
    | 'id'
    | 'position'
    | 'label'
    | 'evidence'
    | 'input_type'
    | 'output_type'
    | 'assistant_role'
    | 'confidence'
>;

export type UseLog = {
    id: number;
    chat_id: number;
    total_use_cases: number;
    raw_output: string;
    summary_statement: string | null;
    chat_snapshot: string | null;
    use_cases?: UseLogCase[];
    parsed?: ParsedUseLog;
    created_at: ISODateString;
    updated_at: ISODateString;
};

export type ParsedUseLog = {
    total_use_cases: number;
    use_cases: ParsedUseLogCase[];
    summary_statement: string;
};

export type NullableParsedUseLog = ParsedUseLog | null;
