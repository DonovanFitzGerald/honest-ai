# Honest-AI
An AI Chat Interface designed to give users insights into personal usage. Supports per conversation summaries and a dashboard for overall insights.

# Setup
## Basic Setup

Clone `.env.example` and rename to `.env`

Start a MySQL Database and configure your `.env` accordingly:

.env 
```
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=honest_ai
DB_USERNAME=honest_ai_user
DB_PASSWORD=
DB_ROOT_PASSWORD=
DB_TIMEZONE=
```

Install dependency packages

```bash
composer install
npm install
```

Start development server

```bash
composer dev
```

## AI API
Integrates with Google Gemini:

.env 
```
GEMINI_API_KEY=your-key-here
```

## Hosting Setup
Configured to work with https://github.com/DonovanFitzGerald/hosting-platform

To setup:
1. Clone and build the hosting repo on your host machine.

2. Configure app `.env`:

.env 
```
APP_URL=https://app.example.com
APP_DOMAIN=app.example.com
PROXY_NETWORK=proxy
TRUSTED_PROXIES=*
```

3. Build the app, hosting stack will discover the app automatically
```
docker compose up -d --build`
```
