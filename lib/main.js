let injectionRegistrations = [];

exports.activate = function () {
  for (const nodeType of ["macro_invocation", "macro_rule"]) {
    injectionRegistrations.push(
      lumine.grammars.addInjectionPoint("source.rust", {
        type: nodeType,
        language() {
          return "rust";
        },
        content(node) {
          return node.lastChild;
        },
        includeChildren: true,
        languageScope: null,
        coverShallowerScopes: true,
      }),
    );
  }
};

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

exports.deactivate = function () {
  for (const registration of injectionRegistrations.splice(0)) registration.dispose();
};
