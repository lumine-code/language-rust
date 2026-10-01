([
  (macro_invocation (token_tree) @injection.content)
  (macro_rule right: (token_tree) @injection.content)
] @injection.owner
  (#set! injection.language "rust")
  (#set! injection.include-children)
  (#set! injection.language-scope "none")
  (#set! injection.cover-shallower-scopes))
