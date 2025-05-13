// RSS源接口
// url: RSS URL地址
// category: 分类名称

/**
 * @typedef {object} RssSource
 * @property {string} name
 * @property {string} url - RSS URL地址
 * @property {string} category - 分类名称
 */



// 默认配置
export const config = {
  sources: [
    {
      name: "Cursor",
      url: "https://www.cursor.com/changelog",
      category: "本地编辑器",
      tag: 'h3',
      container: 'article'
    },
    {
      name: "Windsurf",
      url: "https://windsurf.com/changelog",
      category: "本地编辑器",
      tag: 'h2',
      container: 'article'
    },
    {
      name: "VS CODE",
      url: "https://code.visualstudio.com/updates/v1_100",
      category: "本地编辑器",
      tag: 'h4',
      container: 'main'
    },
    {
      name: "Github Copilot",
      url: "https://github.blog/changelog/2025-05-08-github-copilot-in-vs-code-april-release-v1-100/",
      category: "编辑器插件",
      tag: 'h3',
      container: '.PostContent-main'
    },
  ],
  maxItemsPerFeed: 30,
  dataPath: "./data",
}

export const defaultSource = config.sources[0]

export function findSourceByName(name) {
  return config.sources.find((source) => source.name === name)
}

export function getSourcesByCategory() {
  return config.sources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = []
    }
    acc[source.category].push(source)
    return acc
  }, {})
}
