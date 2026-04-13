import { Plus, Send, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Message } from '@/types/assistant';
import type {
    AssistantModelsSharedData,
    BuiltInTool,
    ThinkingLevel,
} from '@/types/assistant-models';

export type ChatComposerSubmission = Pick<Message, 'content'> & {
    model: Message['model'];
    thinkingLevel: ThinkingLevel;
    tools: BuiltInTool[];
};

type ChatBoxProps = {
    assistantModels: AssistantModelsSharedData;
    initialModel: AssistantModelsSharedData['default'];
    inputText: Message['content'];
    onInputTextChange: (text: Message['content']) => void;
    onSubmit: (submission: ChatComposerSubmission) => void | Promise<void>;
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
        findModelOption(selectedModel, assistantModels) ??
        findModelOption(initialModel, assistantModels);
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>(() =>
        getDefaultThinkingLevel(selectedModelOption),
    );
    const [selectedTools, setSelectedTools] = useState<BuiltInTool[]>([]);
    const normalizedSelectedModel =
        selectedModelOption?.value ?? assistantModels.default;
    const normalizedThinkingLevel = getSupportedThinkingLevel(
        selectedModelOption,
        thinkingLevel,
    );
    const thinkingLevelOptions = selectedModelOption?.thinking_levels ?? [];
    const availableToolOptions = selectedModelOption?.built_in_tools ?? [];
    const addableToolOptions = availableToolOptions.filter(
        (tool) => !selectedTools.includes(tool),
    );

    const addTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => {
            return prev.includes(tool) ? prev : [...prev, tool];
        });
    };

    const removeTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => prev.filter((value) => value !== tool));
    };

    const handleModelChange = (nextModel: string) => {
        const nextModelOption = findModelOption(nextModel, assistantModels);
        const nextAvailableToolOptions = nextModelOption?.built_in_tools ?? [];

        setSelectedModel(nextModel);
        setThinkingLevel(
            getSupportedThinkingLevel(nextModelOption, normalizedThinkingLevel),
        );
        setSelectedTools((currentTools) =>
            currentTools.filter((tool) =>
                nextAvailableToolOptions.includes(tool),
            ),
        );
    };

    const handleSubmit = () => {
        if (sending || !inputText.trim() || !selectedModelOption) {
            return;
        }

        onSubmit({
            content: inputText,
            model: normalizedSelectedModel,
            thinkingLevel: normalizedThinkingLevel,
            tools: selectedTools,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey) return;
        e.preventDefault();
        handleSubmit();
    };

    return (
        <div className="flex h-full max-h-60 min-h-14 w-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border border-border p-2 shadow-lg has-focus-within:outline-1 has-focus-within:outline-black">
            <textarea
                className="peer/input field-sizing-content w-full resize-none px-4 focus:outline-none"
                placeholder="Ask anything..."
                onChange={(e) => onInputTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                value={inputText}
                disabled={sending}
            />
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {addableToolOptions.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-10 shrink-0 cursor-pointer rounded-full bg-background"
                                    disabled={
                                        sending ||
                                        availableToolOptions.length === 0
                                    }
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                side="top"
                                className="w-56 rounded-lg"
                            >
                                {addableToolOptions.map((tool) => (
                                    <DropdownMenuItem
                                        key={tool}
                                        className="cursor-pointer rounded-lg"
                                        onClick={() => addTool(tool)}
                                    >
                                        {tool}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Select
                        value={normalizedSelectedModel}
                        onValueChange={handleModelChange}
                        disabled={
                            sending || assistantModels.options.length === 0
                        }
                    >
                        <SelectTrigger className="h-full w-fit min-w-32 cursor-pointer flex-nowrap truncate rounded-2xl bg-background">
                            <SelectValue placeholder="Choose a model" />
                        </SelectTrigger>
                        <SelectContent>
                            {assistantModels.options.map((model) => (
                                <SelectItem
                                    key={model.value}
                                    value={model.value}
                                    className="cursor-pointer"
                                >
                                    {model.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {thinkingLevelOptions.length > 0 && (
                        <Select
                            value={
                                normalizedThinkingLevel ||
                                thinkingLevelOptions[
                                    thinkingLevelOptions.length - 1
                                ]
                            }
                            onValueChange={(value) =>
                                setThinkingLevel(value as ThinkingLevel)
                            }
                            disabled={sending}
                        >
                            <SelectTrigger className="h-full w-fit min-w-32 cursor-pointer flex-nowrap truncate rounded-2xl bg-background">
                                <SelectValue placeholder="Thinking level" />
                            </SelectTrigger>
                            <SelectContent>
                                {thinkingLevelOptions.length > 0 &&
                                    thinkingLevelOptions.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={option}
                                            className="cursor-pointer"
                                        >
                                            {option}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {selectedTools.length > 0 && (
                    <div className="flex w-full flex-wrap gap-2">
                        {selectedTools.map((tool) => (
                            <div
                                key={tool}
                                className="flex items-center gap-2 rounded-2xl border border-border bg-accent px-3 py-2 text-sm shadow-sm"
                            >
                                <p className="text-accent-foreground">
                                    {tool.split('_').join(' ')}
                                </p>
                                <button
                                    type="button"
                                    className="flex size-5 cursor-pointer items-center justify-center rounded-full text-accent-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => removeTool(tool)}
                                    disabled={sending}
                                    aria-label={`Remove ${tool}`}
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <Button
                    type="button"
                    className="flex aspect-square h-10 w-10 cursor-pointer justify-center rounded-full bg-foreground text-primary-foreground hover:bg-foreground/80"
                    onClick={handleSubmit}
                    disabled={
                        sending || !inputText.trim() || !selectedModelOption
                    }
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}

const findModelOption = (
    model: Message['model'],
    assistantModels: AssistantModelsSharedData,
): AssistantModelsSharedData['options'][number] | undefined =>
    assistantModels.options.find((option) => option.value === model);

const getDefaultThinkingLevel = (
    modelOption?: AssistantModelsSharedData['options'][number],
): ThinkingLevel =>
    modelOption?.thinking_level ?? modelOption?.thinking_levels?.at(-1) ?? null;

const getSupportedThinkingLevel = (
    modelOption?: AssistantModelsSharedData['options'][number],
    thinkingLevel?: ThinkingLevel,
): ThinkingLevel => {
    if (!modelOption) {
        return null;
    }

    if (
        thinkingLevel &&
        (modelOption.thinking_levels ?? []).includes(thinkingLevel)
    ) {
        return thinkingLevel;
    }

    return getDefaultThinkingLevel(modelOption);
};
