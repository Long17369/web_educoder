export interface ProblemSourceFile {
  filename?: string
  language: string
  code: string
}

export interface Problem {
  type: 'problem'
  title: string
  description?: string
  content: ProblemSourceFile[]
}

export interface ProblemSet {
  type: 'problemSet'
  title: string
  content: FileInfo[]
}

export interface FileInfo {
  id: string
  title: string
}

export type DataFileType = 'problem' | 'problemSet'
export type DataFile = Problem | ProblemSet
