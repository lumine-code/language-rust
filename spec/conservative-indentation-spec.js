describe("rust conservative indentation", () => {
  let editor;
  beforeEach(async () => {
    editor = null;
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-rust");
  });
  afterEach(() => editor?.destroy());
  async function start(file, text) {
    if (!editor || !editor.getPath()?.endsWith(file)) {
      editor?.destroy();
      editor = await lumine.workspace.open(file);
    }
    editor.update({ autoIndent: true, tabLength: 2, softTabs: true });
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }
  describe("rs", () => {
    it("indents Enter inside a block", async () => {
      await start("indentation.rs", "fn main() {\n}");
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).toBe("  ");
    });
    it("dedents a typed closing brace", async () => {
      await start("indentation.rs", "fn main() {\n  run();\n  ");
      editor.setCursorBufferPosition([2, Infinity]);
      await editor.insertText("}", { autoIndent: true, autoDecreaseIndent: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(2)).toBe("}");
    });
    it("reindents a body and its closing delimiter once", async () => {
      await start("indentation.rs", "fn main() {\nrun();\n}");
      await editor.autoIndentBufferRows(0, 2);
      expect(editor.getText()).toBe("fn main() {\n  run();\n}");
    });
    it("does not add indent after a complete one-line block or delimiters in a comment", async () => {
      for (const text of ["fn main() { run(); }", "// { [ ("]) {
        await start("indentation.rs", text);
        editor.moveToEndOfLine();
        await editor.insertNewline();
        expect(editor.lineTextForBufferRow(1)).toBe("");
      }
    });
    it("preserves multiline literal whitespace during reindent", async () => {
      const source = 'const VALUE: &str = r#"first\n      { [ (\n  last"#;';
      await start("indentation.rs", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
    it("preserves multiline comment interiors during reindent", async () => {
      const source = "/* first\n      { [ (\n  last */";
      await start("indentation.rs", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
  });

  it("keeps quoted recovery punctuation from indenting the next row", async () => {
    for (const source of [
      'let value = "{',
      'let value = "(',
      'let value = "[',
      'let value = r"{',
      'let value = r#"{',
      'let value = br#"{',
      'let value = cr#"{',
      'let value = b"{',
      'let value = "a\\"{',
    ]) {
      await start("recovery.rs", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).withContext(source).toBe("");
    }
  });

  it("retains the current margin while entering recovered literal text", async () => {
    await start("recovery.rs", 'fn main() {\n  let value = "{');
    editor.setCursorBufferPosition([1, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(2)).toBe("  ");
  });

  it("retains indentation for real incomplete containers and interpolation", async () => {
    for (const source of [
      "fn main() {",
      "let value = [",
      'let value = vec!["done", [',
      'let values = vec![r#"done"#, [',
      'let values = [r#"done"#, [',
    ]) {
      await start("recovery.rs", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.indentationForBufferRow(1)).withContext(source).toBe(1);
    }
  });

  it("preserves authored whitespace in recovered multiline literal content", async () => {
    const source = 'let value = "{\n      payload';
    await start("recovery.rs", source);
    await editor.autoIndentBufferRows(1, 1);
    expect(editor.getText()).toBe(source);
  });
});
