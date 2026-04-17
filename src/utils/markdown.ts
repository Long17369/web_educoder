import MarkdownIt from 'markdown-it'
// @ts-expect-error No types for markdown-it-katex
import markdownItKatex from 'markdown-it-katex'
import MarkdownItHighlight from 'markdown-it-highlightjs'

import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown-light.css'

import { hljs } from './hljs'

const mdParser = new MarkdownIt({
  html: true,
  breaks: false,
})

mdParser.use(markdownItKatex, {
  throwOnError: false,
})

mdParser.use(MarkdownItHighlight, {
  auto: false,
  code: false,
  hljs: hljs,
})

export { mdParser }
