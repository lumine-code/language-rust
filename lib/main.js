exports.consumeHyperlinkInjection = (hyperlink) => {
  return hyperlink.addInjectionPoint("source.rust", {
    types: ["line_comment", "block_comment", "string_literal", "raw_string_literal"],
  });
};

exports.consumeTodoInjection = (todo) => {
  return todo.addInjectionPoint("source.rust", {
    types: ["line_comment", "block_comment"],
  });
};
