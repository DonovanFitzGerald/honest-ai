<?php

namespace App\Support;

class AssistantModelRegistry
{
    public function all(): array
    {
        return config('assistantmodels.models', []);
    }

    public function active(): array
    {
        return array_filter($this->all(), fn(array $model) => $model['active'] ?? false);
    }

    public function options(): array
    {
        return collect($this->active())
            ->map(fn(array $model, string $key) => [
                'value' => $key,
                'label' => $model['label'],
                'provider' => $model['provider'],
                'badge' => $model['badge'] ?? null,
                'supports_tools' => $model['supports_tools'] ?? false,
                'supports_vision' => $model['supports_vision'] ?? false,
            ])
            ->values()
            ->all();
    }

    public function find(string $key): ?array
    {
        return $this->all()[$key] ?? null;
    }

    public function default(): string
    {
        return config('assistantmodels.default');
    }
}