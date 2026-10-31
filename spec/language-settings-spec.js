describe("rust editing settings", () => {
  let editor, pairingWasActive;
  beforeAll(() => {
    pairingWasActive = lumine.packages.isPackageActive("bracket-matcher");
  });
  afterAll(async () => {
    if (!pairingWasActive) await lumine.packages.deactivatePackage("bracket-matcher");
  });
  beforeEach(async () => {
    jasmine.useRealClock();
    editor = null;
    await lumine.packages.activatePackage("language-rust");
    await lumine.packages.activatePackage("bracket-matcher");
  });
  afterEach(() => editor?.destroy());
  async function start(scope, text = "value") {
    editor ??= await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName(scope));
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
    editor.update({ autoIndent: false });
  }
  it("pairs valid punctuation without duplicating unsupported quote or escape characters", async () => {
    for (const [scope, character, expected] of [
      ["source.rust", "`", "`"],
      ["source.rust", '"', '""'],
      ["source.rust", "(", "()"],
    ]) {
      await start(scope, "");
      await editor.insertText(character, { autoIndent: false, autoDecreaseIndent: false });
      await editor.whenGrammarSettled();
      expect(editor.getText())
        .withContext(scope + " " + character)
        .toBe(expected);
    }
  });
  it("types comparisons without automatic angle actions while keeping angle matching configured", async () => {
    await start("source.rust", "left ");
    editor.setCursorBufferPosition([0, Infinity]);
    await editor.insertText("<", { autoIndent: false, autoDecreaseIndent: false });
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe("left <");
    expect(
      lumine.config.get("bracket-matcher.autocompleteCharacters", {
        scope: editor.getRootScopeDescriptor(),
      }),
    ).toContain("<>");
  });
});
