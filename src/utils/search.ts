import type { DataFile, FileInfo } from './types'
import { fetchT } from '../fetchData'

export interface SearchResult {
  title: string
  id: string
  path: string // id 路径，如 'pta/2030646312838070272'
  titlePath: string // title 路径，如 'pta/Python-1-基础'
}

/** 缓存节点：存储已加载的目录数据 */
interface CacheNode {
  items: FileInfo[]
  loaded: boolean
}

/** 全局缓存：key 为 data 下的相对路径（如 'pta/2030646312838070272'） */
const cache = new Map<string, CacheNode>()

/** 清空所有缓存（仅在页面刷新时调用） */
export function clearSearchCache(): void {
  cache.clear()
}

/**
 * 递归搜索指定目录下的所有 problemSet
 * 优先使用缓存，未命中时请求并写入缓存
 */
async function searchRecursive(
  basePath: string[],
  titlePrefix: string,
  onResult: (result: SearchResult) => void,
  onProgress: (ratio: number) => void,
  weight: number,
  abortSignal: () => boolean,
): Promise<void> {
  const cacheKey = basePath.join('/')

  // 尝试从缓存获取
  let node = cache.get(cacheKey)
  if (!node) {
    // 缓存未命中，请求数据
    const url = `/${['data', ...basePath].join('/')}/data.json`
    try {
      const data = await fetchT<DataFile>(url)
      if (abortSignal()) return

      if (data.type === 'problemSet') {
        node = { items: data.content, loaded: true }
      } else {
        // problem 类型，没有子项
        node = { items: [], loaded: true }
      }
    } catch {
      // 加载失败，缓存为空节点避免重复请求
      node = { items: [], loaded: true }
    }
    cache.set(cacheKey, node)
  }

  if (abortSignal()) return

  const items = node.items
  if (items.length === 0) {
    onProgress(weight)
    return
  }

  const itemWeight = weight / items.length
  let accumulated = 0

  for (const item of items) {
    if (abortSignal()) return

    const titlePath = titlePrefix ? `${titlePrefix}/${item.title}` : item.title

    // 立即回调当前结果
    onResult({
      title: item.title,
      id: item.id,
      path: [...basePath, item.id].join('/'),
      titlePath,
    })

    // 递归搜索子目录
    await searchRecursive(
      [...basePath, item.id],
      titlePath,
      onResult,
      (childRatio) => {
        onProgress(accumulated + childRatio * itemWeight)
      },
      itemWeight,
      abortSignal,
    )

    accumulated += itemWeight
    onProgress(accumulated)
  }
}

/**
 * 搜索当前目录下的所有内容，边搜索边通过回调返回结果
 * 优先使用缓存，同时在搜索过程中构建缓存树
 */
export async function searchAll(
  currentPath: string[],
  onResult: (result: SearchResult) => void,
  onProgress: (ratio: number) => void,
  abortSignal: () => boolean,
): Promise<void> {
  await searchRecursive(currentPath, '', onResult, onProgress, 1, abortSignal)
}
