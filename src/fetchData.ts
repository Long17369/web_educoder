import type { Problem, ProblemSet } from './utils/types'

export async function fetchT<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`)
  }
  const data = await response.json()
  return data as T
}

export async function fetchData(path: string[]): Promise<ProblemSet | Problem> {
  path = path.filter((p) => p) // Remove empty segments
  path.unshift('data') // Prepend 'data' to the path
  const url = `/${path.join('/')}/data.json`
  return fetchT<ProblemSet | Problem>(url)
}
