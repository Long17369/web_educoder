import MarkdownIt from 'markdown-it'
// @ts-expect-error No types for markdown-it-katex
import markdownItKatex from 'markdown-it-katex'
// @ts-expect-error No types for markdown-it-highlightjs/core
import MarkdownItHighlight from 'markdown-it-highlightjs/core'

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
