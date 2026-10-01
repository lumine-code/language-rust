const fs = require("fs");
const path = require("path");

const packagePath = (name) => {
  const sibling = path.resolve(__dirname, "..", "..", name);
  return fs.existsSync(sibling) ? sibling : name;
};

describe("language-rust static annotation bodies", () => {
  let editor;

  beforeEach(async () => {
    for (const name of ["language-rust", "language-hyperlink", "language-todo"]) {
      await lumine.packages.activatePackage(packagePath(name));
    }
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.rust"));
  });

  afterEach(() => editor?.destroy());

  it("highlights annotations in comment bodies that have syntax children", async () => {
    const text =
      "/// TODO https://example.com/line\n/** FIXME https://example.com/block */\nfn main() {}\n";
    editor.setText(text);
    await editor.languageMode.ready;
    await editor.languageMode.atGrammarSettlement();
    for (const token of ["TODO", "FIXME"]) {
      const position = editor.getBuffer().positionForCharacterIndex(text.indexOf(token));
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      expect(scopes).toContain("storage.type.class.todo");
      expect(scopes).not.toContain("text.todo");
    }
    for (const token of ["https://example.com/line", "https://example.com/block"]) {
      const position = editor.getBuffer().positionForCharacterIndex(text.indexOf(token));
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      expect(scopes).toContain("markup.underline.link.hyperlink");
      expect(scopes).not.toContain("text.hyperlink");
    }
  });

  it("injects literal string contents without consuming delimiters or escapes", async () => {
    const text =
      'fn main() { let quoted = "https://example.com/quoted\\n"; ' +
      'let raw = r#"https://example.com/raw"#; }';
    editor.setText(text);
    await editor.languageMode.ready;
    await editor.languageMode.atGrammarSettlement();
    const links = editor.languageMode
      .getAllInjectionLayers()
      .filter((layer) => layer.grammar.scopeName === "text.hyperlink");
    expect(links.length).toBe(2);
    expect(
      links
        .flatMap((layer) =>
          layer.getCurrentRanges().map((range) => editor.getTextInBufferRange(range)),
        )
        .sort(),
    ).toEqual(["https://example.com/quoted", "https://example.com/raw"]);
    const position = editor.getBuffer().positionForCharacterIndex(text.indexOf("/quoted"));
    expect(editor.scopeDescriptorForBufferPosition(position).getScopesArray()).toContain(
      "markup.underline.link.hyperlink",
    );
  });
});
