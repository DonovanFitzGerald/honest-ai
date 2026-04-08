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
        return array_filter(
            $this->all(),
            fn(array $model) => (bool) ($model['active'] ?? false),
        );
    }

    public function activeKeys(): array
    {
        return array_keys($this->active());
    }

    public function all_models(): array
    {
        return collect($this->all())
            ->mapWithKeys(fn(array $model, string $key) => [
                $key => [
                    'label' => $model['label'],
                    'provider' => $model['provider'],
                    'active' => (bool) ($model['active'] ?? false),
                    'capabilities' => [
                        'tools' => (bool) data_get($model, 'capabilities.tools', false),
                        'vision' => (bool) data_get($model, 'capabilities.vision', false),
                        'json_mode' => (bool) data_get($model, 'capabilities.json_mode', false),
                    ],
                    'limits' => [
                        'context_window' => data_get($model, 'limits.context_window'),
                        'max_output_tokens' => data_get($model, 'limits.max_output_tokens'),
                    ],
                    'pricing' => [
                        'input_per_1m' => data_get($model, 'pricing.input_per_1m'),
                        'output_per_1m' => data_get($model, 'pricing.output_per_1m'),
                    ],
                    'ui' => [
                        'badge' => data_get($model, 'ui.badge'),
                        'description' => data_get($model, 'ui.description'),
                    ],
                ],
            ])
            ->all();
    }

    public function options(): array
    {
        return collect($this->active())
            ->map(fn(array $model, string $key) => [
                'value' => $key,
                'label' => $model['label'],
                'provider' => $model['provider'],
                'badge' => data_get($model, 'ui.badge'),
                'description' => data_get($model, 'ui.description'),
                'supports_tools' => (bool) data_get($model, 'capabilities.tools', false),
                'supports_vision' => (bool) data_get($model, 'capabilities.vision', false),
                'supports_json_mode' => (bool) data_get($model, 'capabilities.json_mode', false),
            ])
            ->values()
            ->all();
    }

    public function find(string $key): ?array
    {
        return $this->all_models()[$key] ?? null;
    }

    public function default(): string
    {
        $default = (string) config('assistantmodels.default', '');

        if ($default !== '' && isset($this->all()[$default])) {
            return $default;
        }

        return array_key_first($this->active())
            ?? array_key_first($this->all())
            ?? '';
    }

    public function defaultModel(): ?array
    {
        return $this->find($this->default());
    }

    public function resolveKey(?string $key, bool $activeOnly = true): ?string
    {
        $models = $activeOnly ? $this->active() : $this->all();

        if (is_string($key) && isset($models[$key])) {
            return $key;
        }

        $default = $this->default();

        if ($default !== '' && isset($models[$default])) {
            return $default;
        }

        return array_key_first($models);
    }
}
