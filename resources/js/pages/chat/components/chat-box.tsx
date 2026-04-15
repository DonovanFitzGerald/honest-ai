import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/assistant';
import type {
    AssistantModelsSharedData,
    BuiltInTool,
    ThinkingLevel,
} from '@/types/assistant-models';
import type { ChatSendInput } from '../chat.types';
import ChatBoxInput from './chat-box-input';
import ChatOptionSelect from './chat-option-select';
import SelectedTool from './selected-tool';
import ToolPicker from './tool-picker';

const findModelOption = (
    assistantModels: AssistantModelsSharedData,
    model: Message['model'],
) => assistantModels.options.find((option) => option.value === model);

const resolveThinkingLevel = (
    modelOption?: AssistantModelsSharedData['options'][number],
    thinkingLevel?: ThinkingLevel,
): ThinkingLevel => {
    if (!modelOption) {
        return null;
    }

    if (thinkingLevel && modelOption.thinking_levels?.includes(thinkingLevel)) {
        return thinkingLevel;
    }

    return modelOption.thinking_levels?.at(-1) ?? null;
};

type ChatBoxProps = {
    assistantModels: AssistantModelsSharedData;
    initialModel: AssistantModelsSharedData['default'];
    inputText: Message['content'];
    onInputTextChange: (text: Message['content']) => void;
    onSubmit: (submission: ChatSendInput) => void | Promise<void>;
    sending: boolean;
};

export default function ChatBox({
    assistantModels,
    initialModel,
    inputText,
    onInputTextChange,
    onSubmit,
    sending,
}: ChatBoxProps) {
    const [selectedModel, setSelectedModel] = useState(initialModel);
    const selectedModelOption =
        findModelOption(assistantModels, selectedModel) ??
        findModelOption(assistantModels, initialModel);
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>(() =>
        resolveThinkingLevel(selectedModelOption),
    );
    const [selectedTools, setSelectedTools] = useState<BuiltInTool[]>([]);
    const normalizedSelectedModel =
        selectedModelOption?.value ?? assistantModels.default;
    const normalizedThinkingLevel = resolveThinkingLevel(
        selectedModelOption,
        thinkingLevel,
    );
    const thinkingLevelOptions = selectedModelOption?.thinking_levels ?? [];
    const availableToolOptions = selectedModelOption?.built_in_tools ?? [];
    const addableToolOptions = availableToolOptions.filter(
        (tool) => !selectedTools.includes(tool),
    );

    const handleModelChange = (nextModel: string) => {
        const nextModelOption = findModelOption(assistantModels, nextModel);
        const nextAvailableToolOptions = nextModelOption?.built_in_tools ?? [];

        setSelectedModel(nextModel);
        setThinkingLevel(resolveThinkingLevel(nextModelOption, thinkingLevel));
        setSelectedTools((currentTools) =>
            currentTools.filter((tool) =>
                nextAvailableToolOptions.includes(tool),
            ),
        );
    };

    const handleSubmit = () => {
        if (!inputText.trim()) return;
        if (sending) return;
        onSubmit({
            content: inputText,
            model: normalizedSelectedModel,
            thinkingLevel: normalizedThinkingLevel,
            tools: selectedTools,
        });
    };

    const thinkingOptions = thinkingLevelOptions.map((option) => ({
        label: option,
        value: option,
    }));
    const thinkingValue =
        normalizedThinkingLevel ?? thinkingLevelOptions.at(-1);

    const addTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => {
            return prev.includes(tool) ? prev : [...prev, tool];
        });
    };

    const removeTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => prev.filter((value) => value !== tool));
    };

    return (
        <div className="flex h-full max-h-60 min-h-14 w-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border border-border p-2 shadow-lg has-focus-within:outline-1 has-focus-within:outline-black">
            <ChatBoxInput
                value={inputText}
                disabled={sending}
                onChange={onInputTextChange}
                onSubmit={handleSubmit}
            />
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {addableToolOptions.length > 0 && (
                        <ToolPicker
                            addableToolOptions={addableToolOptions}
                            onAddTool={addTool}
                            sending={sending}
                        />
                    )}
                    <ChatOptionSelect
                        value={normalizedSelectedModel}
                        onValueChange={handleModelChange}
                        disabled={
                            sending || assistantModels.options.length === 0
                        }
                        options={assistantModels.options.map((model) => ({
                            label: model.label,
                            value: model.value,
                        }))}
                        placeholder="Choose a model"
                    />
                    {thinkingOptions.length > 0 && (
                        <ChatOptionSelect
                            value={thinkingValue}
                            onValueChange={(value) =>
                                setThinkingLevel(
                                    value as Exclude<ThinkingLevel, null>,
                                )
                            }
                            disabled={sending}
                            options={thinkingOptions}
                            placeholder="Thinking level"
                            triggerClassName="h-full w-fit min-w-32 cursor-pointer flex-nowrap truncate rounded-2xl bg-background capitalize"
                            itemClassName="cursor-pointer capitalize"
                        />
                    )}
                </div>

                <div className="flex w-full flex-wrap gap-2">
                    {selectedTools.map((tool) => (
                        <SelectedTool
                            key={tool}
                            tool={tool}
                            onRemoveTool={removeTool}
                            disabled={sending}
                        />
                    ))}
                </div>
                <Button
                    type="button"
                    className="flex aspect-square h-10 w-10 cursor-pointer justify-center rounded-full bg-foreground text-primary-foreground hover:bg-foreground/80"
                    onClick={handleSubmit}
                    disabled={sending}
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}
