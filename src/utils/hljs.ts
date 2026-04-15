import hljs from 'highlight.js'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import xml from 'highlight.js/lib/languages/xml'

// Legacy markdown uses ```in / ```out fences for sample IO; register no-op languages to avoid warnings.
hljs.registerLanguage('in', () => ({ name: 'in', contains: [] }))
hljs.registerLanguage('out', () => ({ name: 'out', contains: [] }))
hljs.registerLanguage('java', java)
hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)

export default hljs
