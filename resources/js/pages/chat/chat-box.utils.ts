import type { Message } from '@/types/assistant';
import type {
    AssistantModelsSharedData,
    ThinkingLevel,
} from '@/types/assistant-models';

export const findModelOption = (
    model: Message['model'],
    assistantModels: AssistantModelsSharedData,
): AssistantModelsSharedData['options'][number] | undefined =>
    assistantModels.options.find((option) => option.value === model);

export const getDefaultModelThinkingLevel = (
    modelOption?: AssistantModelsSharedData['options'][number],
): ThinkingLevel =>
    modelOption?.thinking_level ?? modelOption?.thinking_levels?.at(-1) ?? null;

export const getModelThinkingLevel = (
    modelOption?: AssistantModelsSharedData['options'][number],
    thinkingLevel?: ThinkingLevel,
): ThinkingLevel => {
    if (!modelOption) {
        return null;
    }

    if (thinkingLevel && modelOption.thinking_levels?.includes(thinkingLevel)) {
        return thinkingLevel;
    }

    return getDefaultModelThinkingLevel(modelOption);
};
