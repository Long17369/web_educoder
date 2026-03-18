export interface ProblemItem {
  title: string
  id: string
  proid: string
}

export interface ProblemSetData {
  title: string
  id: string
  content: ProblemItem[]
}

export interface ProblemSourceFile {
  filename?: string
  language?: string
  code: string
}

export interface ProblemPageData {
  title?: string
  description: string
  files: ProblemSourceFile[]
}
