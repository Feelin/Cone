# Cone 🚀

Changelogs in one place.

Cone is an intelligent tool that crawls product changelogs across the web, then uses AI to summarize and translate them into your preferred language.

## Features ✨

- **Automated Crawling**: Collects changelogs from various products automatically by cron task
- **AI Summarization**: Condenses lengthy update notes into key points
- **Multi-language Translation**: Translates changelogs while preserving technical accuracy
- **Customizable Alerts**: Get notified about updates that matter to you by Dingding message hook

## How It Works ⚙️

1. **Crawling**: Spiders collect raw changelog data from target sources
2. **Processing**: AI extracts essential information and removes noise
3. **Summarization**: LLM generate concise summaries
4. **Translation**: Content is translated while maintaining technical precision
5. **Delivery**: Results are presented through web hook



## Quick Start
```bash
git clone https://github.com/Feelin/cone.git
cd cone
npm run dev
```

## Configuration 🔧
Edit the .env file and add your API credentials. Example configuration:
```bash
LLM_API_KEY="your_api_key_here"          # Your authentication key
LLM_API_BASE="https://api.siliconflow.cn/v1"  # API endpoint
LLM_NAME="THUDM/GLM-4-9B-0414"          # Model identifier
```

## Screenshot
<img width="879" alt="image" src="https://github.com/user-attachments/assets/1a9ff096-92b4-43ff-9281-3a2a955ec84e" />


