["{" "[" "("] @indent

["}" "]" ")"] @dedent

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (raw_string_literal) (block_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
