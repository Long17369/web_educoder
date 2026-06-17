import * as fs from 'node:fs'
import * as path from 'node:path'

interface FileInfo {
  id: string
  title: string
}

interface SearchEntry {
  title: string
  id: string
  path: string // id 路径，如 'pta/2030646312838070272'
  titlePath: string // title 路径，如 'pta/Python-1-基础'
}

const dataDir = path.resolve(import.meta.dirname, '..', 'data')
const outputFile = path.resolve(import.meta.dirname, '..', 'public', 'search-index.json')

function walk(dirPath: string, idPath: string[], titlePath: string): SearchEntry[] {
  const entries: SearchEntry[] = []
  const jsonPath = path.join(dirPath, 'data.json')

  if (!fs.existsSync(jsonPath)) return entries

  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(raw)

    if (data.type !== 'problemSet' || !Array.isArray(data.content)) return entries

    for (const item of data.content as FileInfo[]) {
      const itemIdPath = [...idPath, item.id]
      const itemTitlePath = titlePath ? `${titlePath}/${item.title}` : item.title

      entries.push({
        title: item.title,
        id: item.id,
        path: itemIdPath.join('/'),
        titlePath: itemTitlePath,
      })

      // 递归子目录
      const childDir = path.join(dirPath, item.id)
      if (fs.existsSync(childDir) && fs.statSync(childDir).isDirectory()) {
        entries.push(...walk(childDir, itemIdPath, itemTitlePath))
      }
    }
  } catch {
    // 解析失败，跳过
  }

  return entries
}

console.log('Generating search index...')
const allEntries = walk(dataDir, [], '')

// 确保 public 目录存在
const publicDir = path.dirname(outputFile)
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(outputFile, JSON.stringify(allEntries), 'utf-8')
console.log(`Search index generated: ${allEntries.length} entries -> ${outputFile}`)
