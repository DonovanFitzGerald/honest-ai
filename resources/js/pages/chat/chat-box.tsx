import { Plus, Send, X } from 'lucide-react';
import React, { useState } from 'react';
import { useMemo } from 'react';
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
    AssistantModelOption,
    AssistantModelsSharedData,
    BuiltInTool,
    ThinkingLevel,
} from '@/types/assistant-models';

export default function ChatBox({
    inputText,
    setInputText,
    initialMessages,
    assistantModels,
    handleInputSubmit,
    sendErrors,
    setSendErrors,
    sending,
}: {
    inputText: string;
    setInputText: (text: string) => void;
    initialMessages: Message[];
    assistantModels: AssistantModelsSharedData;
    handleInputSubmit: (
        content: string,
        options: {
            model: string | null;
            thinkingLevel: ThinkingLevel;
            tools: BuiltInTool[];
        },
    ) => void;
    sendErrors: string[];
    setSendErrors: (errors: string[]) => void;
    sending: boolean;
}) {
    const [selectedModel, setSelectedModel] = useState(
        initialMessages[initialMessages.length - 1].model ?? defaultModel,
    );
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>(
        selectedModel.thinking_levels[selectedModel.thinking_levels.length - 1],
    );
    const [selectedTools, setSelectedTools] = useState<BuiltInTool[]>([]);

    // MARK: Model

    // MARK: Tools
    const addTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => {
            return prev.includes(tool) ? prev : [...prev, tool];
        });
    };

    const removeTool = (tool: BuiltInTool) => {
        setSelectedTools((prev) => prev.filter((value) => value !== tool));
    };

    const availableToolOptions: BuiltInTool[] = useMemo(
        () => selectedModelOption?.built_in_tools ?? [],
        [selectedModelOption],
    );
    const addableToolOptions: BuiltInTool[] = useMemo(
        () =>
            availableToolOptions.filter(
                (tool: BuiltInTool) => !selectedTools.includes(tool),
            ),
        [availableToolOptions, selectedTools],
    );

    // MARK: Input

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey) return;
        e.preventDefault();
        handleInputSubmit(inputText, {
            model: selectedModel,
            thinkingLevel: thinkingLevel,
            tools: selectedTools,
        });
    };

    return (
        <div className="flex h-full max-h-60 min-h-14 w-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border border-border p-2 shadow-lg has-focus-within:outline-1 has-focus-within:outline-black">
            <textarea
                className="peer/input field-sizing-content w-full resize-none px-4 focus:outline-none"
                placeholder="Ask anything..."
                onChange={(e) => {
                    if (sendErrors.length > 0) {
                        setSendErrors([]);
                    }

                    setInputText(e.target.value);
                }}
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
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                        disabled={sending}
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
                                thinkingLevel ||
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
                    onClick={() => send()}
                    disabled={sending}
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}

const getSelectedModel = (
    messages: Message[],
    assistantModels: AssistantModelsSharedData,
): string => {
    const activeModels = new Set(
        assistantModels.options.map((model) => model.value),
    );

    const latestAssistantModel = [...messages]
        .reverse()
        .find(
            (message) =>
                message.role === 'assistant' &&
                typeof message.model === 'string' &&
                activeModels.has(message.model),
        )?.model;

    return latestAssistantModel ?? assistantModels.default;
};
