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
