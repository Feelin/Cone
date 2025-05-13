import { NextApiRequest, NextApiResponse } from "next";
import {db} from '@/server/db';
const { OpenAI } = require('openai');

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
export async function generateSummary(title: string | null | undefined, content: string | null | undefined): string {
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


export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
// update summary
    const features = await db.feature.findMany({
        where: {
            status: 0
        }
    });
    for (const feature of features) {
        const summary = await generateSummary(feature.title, feature.content);

        await db.feature.update({
            where: { id: feature.id },
            data: {
            summary,
            status: 1
            }
        });
    }
    return res.status(200).json({message: 'Summary generate success.'})
}
