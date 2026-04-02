export type ModelCapabilitySet = {
    tools: boolean;
    vision: boolean;
    json_mode: boolean;
};

export type ModelLimits = {
    context_window: number | null;
    max_output_tokens: number | null;
};

export type ModelPricing = {
    input_per_1m: number | null;
    output_per_1m: number | null;
};

export type ModelUiMeta = {
    badge: string | null;
    description: string | null;
};

export type AssistantModelDefinition = {
    label: string;
    provider: string;
    active: boolean;
    capabilities: ModelCapabilitySet;
    limits: ModelLimits;
    pricing: ModelPricing;
    ui: ModelUiMeta;
};

export type AssistantModelMap = Record<string, AssistantModelDefinition>;

export type AssistantModelOption = {
    value: string;
    label: string;
    provider: string;
    badge: string | null;
    description: string | null;
    supports_tools: boolean;
    supports_vision: boolean;
    supports_json_mode: boolean;
};

export type AssistantModelsSharedData = {
    default: string;
    options: AssistantModelOption[];
};
