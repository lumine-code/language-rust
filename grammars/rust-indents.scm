; Recovery can expose quoted data as ordinary punctuation without a literal node.
(ERROR "\"" @match.next
  (#set! indent.match startPosition))

; The raw-string scanner can also omit its opener token during recovery.
((ERROR) @match.next
  (#match? @match.next "\\b[bc]?r#*\"[^\n]*$")
  (#is-not? test.ancestorOfType "raw_string_literal string_literal")
  (#is? test.startsOnSameRowAs endPosition)
  (#set! indent.match startPosition))

; Once recovery splits a multiline literal, its payload still owns its spaces.
((ERROR (ERROR "\"")) @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

((ERROR) @preserve
  (#match? @preserve "\\b[bc]?r#*\"")
  (#is-not? test.ancestorOfType "raw_string_literal string_literal")
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

["{" "[" "("] @indent

["}" "]" ")"] @dedent

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (raw_string_literal) (block_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
