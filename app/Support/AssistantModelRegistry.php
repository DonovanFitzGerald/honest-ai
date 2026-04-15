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
                'thinking_levels' => $this->capabilityList($model, 'thinking_levels'),
                'built_in_tools' => $this->capabilityList($model, 'built_in_tools'),
            ])
            ->values()
            ->all();
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

    public function capabilitiesFor(?string $key): array
    {
        $model = $this->resolvedModel($key);

        return [
            'thinking_levels' => $this->capabilityList($model, 'thinking_levels'),
            'built_in_tools' => $this->capabilityList($model, 'built_in_tools'),
        ];
    }

    private function resolvedModel(?string $key): array
    {
        $resolvedKey = $this->resolveKey($key);

        return is_string($resolvedKey) && $resolvedKey !== ''
            ? $this->all()[$resolvedKey] ?? []
            : [];
    }

    private function capabilityList(array $model, string $name): array
    {
        return array_values(data_get($model, "capabilities.{$name}", []));
    }
}
