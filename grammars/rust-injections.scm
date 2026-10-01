([
  (macro_invocation (token_tree) @injection.content)
  (macro_rule right: (token_tree) @injection.content)
] @injection.owner
  (#set! injection.language "rust")
  (#set! injection.include-children)
  (#set! injection.language-scope "none")
  (#set! injection.cover-shallower-scopes))

; Annotation candidates are filtered by the target grammar.
([
  (line_comment)
  (block_comment)
] @injection.owner @injection.content
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))

([
  (string_literal (string_content) @injection.content)
  (raw_string_literal (string_content) @injection.content)
] @injection.owner
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none"))

([
  (line_comment)
  (block_comment)
] @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
