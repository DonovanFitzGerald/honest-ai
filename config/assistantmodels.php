<?php

return [
    'default' => 'gemini-3.1-pro-preview',

    'models' => [
        'gemini-3.1-flash-lite-preview' => [
            'label' => 'Gemini 3.1 Flash-Lite Preview',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'thinking_levels' => [
                    'low',
                    'medium',
                    'high',
                ],
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m' => 0.25,
                'output_per_1m' => 1.50,
            ],

            'ui' => [
                'badge' => 'Fastest',
                'description' => 'Lowest-cost Gemini 3 text model for high-volume chat, extraction, and lightweight reasoning.',
            ],
        ],

        'gemini-3-flash-preview' => [
            'label' => 'Gemini 3 Flash Preview',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'thinking_levels' => [
                    'low',
                    'medium',
                    'high',
                ],
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m' => 0.50,
                'output_per_1m' => 3.00,
            ],

            'ui' => [
                'badge' => 'Balanced',
                'description' => 'General-purpose Gemini 3 preview model with stronger reasoning than Lite at moderate cost.',
            ],
        ],

        'gemini-3.1-pro-preview' => [
            'label' => 'Gemini 3.1 Pro Preview',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'thinking_levels' => [
                    'low',
                    'medium',
                    'high',
                ],
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m_under_200k' => 2.00,
                'output_per_1m_under_200k' => 12.00,
                'input_per_1m_over_200k' => 4.00,
                'output_per_1m_over_200k' => 18.00,
            ],

            'ui' => [
                'badge' => 'Deep Reasoning',
                'description' => 'Best Gemini 3 option for harder coding, complex analysis, and long-context reasoning.',
            ],
        ],

        'gemini-2.5-flash-lite' => [
            'label' => 'Gemini 2.5 Flash-Lite',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m' => 0.10,
                'output_per_1m' => 0.40,
            ],

            'ui' => [
                'badge' => 'Cheapest',
                'description' => 'Smallest and most cost-effective stable model for at-scale, latency-sensitive workloads.',
            ],
        ],

        'gemini-2.5-flash' => [
            'label' => 'Gemini 2.5 Flash',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m' => 0.30,
                'output_per_1m' => 2.50,
            ],

            'ui' => [
                'badge' => 'Balanced',
                'description' => 'Best stable price-performance option for low-latency chat and general reasoning.',
            ],
        ],

        'gemini-2.5-pro' => [
            'label' => 'Gemini 2.5 Pro',
            'provider' => 'Google Gemini',
            'active' => true,

            'capabilities' => [
                'tools' => true,
                'vision' => true,
                'json_mode' => true,
                'built_in_tools' => [
                    'google_search',
                    'url_context',
                ],
            ],

            'limits' => [
                'context_window' => 1048576,
                'max_output_tokens' => 65536,
            ],

            'pricing' => [
                'input_per_1m_under_200k' => 1.25,
                'output_per_1m_under_200k' => 10.00,
                'input_per_1m_over_200k' => 2.50,
                'output_per_1m_over_200k' => 15.00,
            ],

            'ui' => [
                'badge' => 'Deep Reasoning',
                'description' => 'Stable higher-end model for difficult reasoning, coding, and long-context work.',
            ],
        ],
    ],
];