<?php

return [
    'default' => 'gemini-3.1-flash-lite-preview',

    'models' => [
        'gemini-3.1-flash-lite-preview' => [
            'label' => 'Gemini 3.1 Flash Lite',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
            ],

            'limits' => [
                'context_window' => 128000,
                'max_output_tokens' => 16000,
            ],

            'pricing' => [
                'input_per_1m' => 0.30,
                'output_per_1m' => 1.20,
            ],

            'ui' => [
                'badge' => 'Fast',
                'description' => 'Good default for everyday chat',
            ],
        ],
    ],
];