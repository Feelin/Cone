import { NextApiRequest, NextApiResponse } from "next";
import {db} from '@/server/db';
import { createHash } from "crypto";
const cheerioReq = require("cheerio-req");
const cheerio = require("cheerio");
import {config} from '@/config/rss-config';
import type { Source } from "@/lib/types";
const {sources} = config;
import axios from 'axios';
import { generateSummary } from "./summary";


async function sendDingDing(params: {
  product: string;
  features: {title: string, hash: string}[];
}) {
  const { product, features } = params;
  const message = {
    msgtype: 'markdown',
    markdown: {
      title: `${product}新功能发布`,
      text: `### ${product}新功能发布 \n\n ${
          features.map((item: {title: string, hash: string}) => {
          return `- [${item.title}](https://cone-seven.vercel.app/?source=${product}#${item.hash}) `
        }).join('\n')
      }
      `,
      at: {
        atMobiles: [],
        isAtAll: false
      }
    }
  };
  console.log(message);
  axios.post(process.env.DINGDING_HOOK!, message);
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    const featureList: {[key: string]: {title: string, hash: string}[]} = {};
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
          // remove title
          const content = $feature.html().replace($feature(product.tag).first(), '');
        
    
          // if hash exists, skip
          const hash = createHash('sha256').update(content).digest('hex');
          const existing = await db.feature.findFirst({
            where: { hash }
          });
          if (existing) continue;
          const summary = await generateSummary(title, content);
          // Save to database
          await db.feature.create({
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
          featureList[product.name].push({title, hash})
        }
    }

    const promises = sources.map(async (source) => {
      return await fetchContent(source)
    })
    await Promise.all(promises)
    Object.entries(featureList).forEach(([product, features]) => {
      sendDingDing({
        product,
        features
      })
    })
    
    return res.status(200).json({message: 'Scheduled task executed successfully.'})
}

