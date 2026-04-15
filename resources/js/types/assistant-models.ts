export type Provider = 'Google Gemini' | (string & {});
export type ThinkingLevel = 'low' | 'medium' | 'high' | null;
export type BuiltInTool = 'google_search' | 'url_context' | (string & {});

export type StandardPricing = {
    input_per_1m: number | null;
    output_per_1m: number | null;
};

export type TieredPricing = {
    input_per_1m_under_200k: number | null;
    output_per_1m_under_200k: number | null;
    input_per_1m_over_200k: number | null;
    output_per_1m_over_200k: number | null;
};

export type ModelPricing = StandardPricing | TieredPricing;

export type ModelLimits = {
    context_window: number | null;
    max_output_tokens: number | null;
};

export type ModelUiMeta = {
    badge: string | null;
    description: string | null;
};

export type ModelCapabilitySet = {
    tools: boolean;
    vision: boolean;
    json_mode: boolean;
    thinking_levels?: Exclude<ThinkingLevel, null>[];
    built_in_tools: BuiltInTool[];
};

export type AssistantModelDefinition = {
    label: string;
    provider: Provider;
    active: boolean;
    capabilities: ModelCapabilitySet;
    limits: ModelLimits;
    pricing: ModelPricing;
    ui: ModelUiMeta;
};

export type AssistantModelMap = Record<string, AssistantModelDefinition>;

export type AssistantModelsConfig = {
    default: string;
    models: AssistantModelMap;
};

type ModelOptionBase = Pick<AssistantModelDefinition, 'label' | 'provider'> &
    ModelUiMeta;

export type AssistantModelOption = ModelOptionBase & {
    value: string;
    supports_tools: boolean;
    supports_vision: boolean;
    supports_json_mode: boolean;
    thinking_levels?: Exclude<ThinkingLevel, null>[];
    built_in_tools: BuiltInTool[];
};

export type AssistantModelsSharedData = {
    default: string;
    options: AssistantModelOption[];
};
