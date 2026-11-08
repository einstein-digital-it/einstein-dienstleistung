<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Online payment (Stripe Checkout). Keys: Stripe Dashboard > Developers.
    'file_abo' => [
        // "Meine Unterlagen" Abo: gross monthly price in cents (VAT included)
        'price_cents' => (int) env('FILE_ABO_PRICE_CENTS', 499),
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET', ''),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
    ],

    // VAT added on top of the (net) service prices
    'tax' => [
        'vat_rate' => (float) env('VAT_RATE', 0.19),
    ],

    // MCP admin endpoint for Claude: POST /api/mcp/{MCP_SECRET}. Empty = disabled.
    'mcp' => [
        'secret' => env('MCP_SECRET', ''),
    ],


    // Automatic sorting and translation of customer documents (Claude API)
    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY', ''),
        'model' => env('ANTHROPIC_MODEL', 'claude-sonnet-5-5'),
        // Longer papers are refused before anything is billed (roughly 10-15 pages)
        'max_input_tokens' => (int) env('ANTHROPIC_MAX_INPUT_TOKENS', 30000),
    ],

];
