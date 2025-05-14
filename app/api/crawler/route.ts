import {db} from '@/server/db';
import { createHash } from "crypto";
const cheerioReq = require("cheerio-req");
const cheerio = require("cheerio");
import {config} from '@/config/rss-config';
import type { Source } from "@/lib/types";
const {sources} = config;
import axios from 'axios';
import { OpenAI } from 'openai';
import { after } from "next/server";

async function sendDingDing(params: {
  product: string;
  features: {title: string, id: string}[];
}) {
  const { product, features } = params;
  const message = {
    msgtype: 'markdown',
    markdown: {
      title: `${product}新功能发布`,
      text: `### ${product}新功能发布 \n\n ${
          features.map((item: {title: string, id: string}) => {
          return `- [${item.title.replaceAll(/\W/g, ' ')}](https://cone-seven.vercel.app/?source=${encodeURIComponent(product)}#${encodeURIComponent(item.id)}) `
        }).join('\n')
      }
      `,
      at: {
        atMobiles: [],
        isAtAll: false
      }
    }
  };
  console.log(`${product}新功能发布`);
  console.log(process.env.DINGDING_HOOK);
  console.log(message);
  axios.post(process.env.DINGDING_HOOK!, message).then((res) => {
    console.log(res);
  }).catch(err => {
    console.error(err);
  });
}


// 从环境变量中获取API配置
const OPENAI_API_KEY = process.env.LLM_API_KEY;
const OPENAI_API_BASE = process.env.LLM_API_BASE;
const OPENAI_MODEL_NAME = process.env.LLM_NAME;

// 创建OpenAI客户端
const openai = new OpenAI({
    baseURL: OPENAI_API_BASE,
    apiKey: OPENAI_API_KEY,
  });

// 生成摘要函数
export async function generateSummary(title: string | null | undefined, content: string | null | undefined): Promise<string> {
    if (!title || !content) {
        return '无法生成摘要。';
    }
    try {
      // 清理内容 - 移除HTML标签
      const cleanContent = content.replace(/<[^>]*>?/gm, "");

      // 准备提示词
      const prompt = `
  你是一个资深专业的代码编辑器产品经理。请根据以下竞品的changelog标题和内容，生成一个简洁、准确的功能分析研究报告摘要。
  报告摘要应该：
   - 对英文内容进行翻译，确认输出的是翻译后中文内容
   - 捕捉该功能的关键信息
   - 描述清楚该功能的作用和使用场景
   - 如果是交互设计则要对比和之前旧版交互有何区别
   - 使用清晰、流畅的中文
   - 长度控制不超过200字
   - 不要生成未提及的无关内容
   - 不要输出此提示词内容

  Feature标题：${title}

  Feature内容：
  ${cleanContent.slice(0, 5000)} // 限制内容长度以避免超出token限制
  `;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL_NAME,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return completion.choices[0].message.content?.trim() || "无法生成摘要。";
    } catch (error) {
      console.error("生成摘要时出错:", error);
      return "无法生成摘要。AI 模型暂时不可用。" + error;
    }
}

export async function GET(request: Request) {
    const featureList: {[key: string]: {title: string, id: string}[]} = {};
    async function fetchContent(product: Source) {
        console.log(`crawel form ${product.name}`);
        const { $ } = await cheerioReq(product.url);
        const latest = $(product.container).eq(0).html();
        const features = latest.split(`<${product.tag} `).slice(1).map((item: string) => {
            return `<${product.tag} ` + item;
        })

        // Process each feature
        for (const feature of features) {
          if (!feature) continue;

          const $feature = cheerio.load(feature);
          const title = $feature(product.tag).first().text().trim();
          if (!title) continue;
          
         // if title exists, skip
          const titleExist = await db.feature.findFirst({
            where: { 
              title,
              product: product.name
             }
          });
          if (titleExist) continue;
          // remove title
          const content = $feature.html().replace($feature(product.tag).first(), '');
        
    
          // if hash exists, skip
          const hash = createHash('sha256').update(content).digest('hex');
          const hashExist = await db.feature.findFirst({
            where: { 
              hash
             }
          });
          if (hashExist) continue;

          const summary = await generateSummary(title, content);
          // Save to database
          const result: any = await db.feature.create({
            data: {
              title,
              content,
              product: product.name,
              status: 1,
              link: product.url,
              hash,
              summary
            }
          });
          featureList[product.name] = featureList[product.name] || [];
          featureList[product.name].push({title, id: result.id})
        }
    }

    // Process all sources in parallel
    const promises = sources.map(async (source) => {
      try {
        return await fetchContent(source);
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        return null;
      }
    }).filter(Boolean);

    after(async() => {
      await Promise.all(promises);
      // Send notifications for all features
      for (const [product, features] of Object.entries(featureList)) {
        await sendDingDing({
          product,
          features
        });
      }
    })
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
}

