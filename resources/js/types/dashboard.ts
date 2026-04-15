import type {
    AssistantRole,
    ISODateString,
    InputType,
    ModelKey,
    OutputType,
} from './assistant';

export type ChartSeries = {
    labels: string[];
    values: number[];
};

export type DashboardUseLogCaseRow = {
    input_type: InputType[];
    output_type: OutputType[];
    assistant_role: AssistantRole | null;
};

export type DashboardPromptRow = {
    created_at: ISODateString | null;
};

export type DashboardAssistantResponseRow = {
    created_at: ISODateString | null;
    tokens: number;
    model: ModelKey | null;
};

export type DashboardProps = {
    cases: DashboardUseLogCaseRow[];
    prompts: DashboardPromptRow[];
    assistantResponses: DashboardAssistantResponseRow[];
};
