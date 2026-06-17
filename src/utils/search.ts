export interface SearchResult {
  title: string
  id: string
  path: string // id 路径，如 'pta/2030646312838070272'
  titlePath: string // title 路径，如 'pta/Python-1-基础'
}

/** 全局搜索索引，页面加载时从预生成文件加载 */
let searchIndex: SearchResult[] | null = null
let loadPromise: Promise<void> | null = null

async function ensureIndex(): Promise<void> {
  if (searchIndex) return
  if (loadPromise) return loadPromise

  loadPromise = fetch('/search-index.json')
    .then((res) => res.json())
    .then((data: SearchResult[]) => {
      searchIndex = data
    })
    .catch(() => {
      searchIndex = []
    })

  return loadPromise
}

/**
 * 搜索当前目录下的所有内容
 * 从预构建的搜索索引中过滤，纯内存操作，无网络请求
 */
export async function searchAll(
  currentPath: string[],
  onResult: (result: SearchResult) => void,
  onProgress: (ratio: number) => void,
  abortSignal: () => boolean,
): Promise<void> {
  await ensureIndex()

  if (!searchIndex || searchIndex.length === 0) {
    onProgress(1)
    return
  }

  const prefix = currentPath.join('/')
  const total = searchIndex.length
  let done = 0

  for (const entry of searchIndex) {
    if (abortSignal()) return

    // 只返回当前目录下的结果
    if (!prefix || entry.path.startsWith(prefix + '/') || entry.path.startsWith(prefix)) {
      onResult(entry)
    }

    done++
    onProgress(done / total)
  }
}
