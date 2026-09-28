const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const HIGHLIGHTS_PATH = path.join(__dirname, "..", "grammars", "rust-highlights.scm");

describe("Rust Tree-sitter highlights", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-rust");
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor = await lumine.workspace.open("parameters.rs");
    editor.setText(text);
    await editor.getBuffer().languageMode.ready;
  }

  async function rawCaptures(startRow, endRow) {
    const groups = await editor.getGrammarQueryCaptureGroups("highlightsQuery", {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
    return groups.find(({ grammar }) => grammar === editor.getGrammar())?.captures ?? [];
  }

  it("keeps a large parameter list locally rooted and tile captures local", async () => {
    const lines = ["fn generated("];
    for (let index = 0; index < 6000; index++) {
      lines.push(`  parameter_${index}: i32${index < 5999 ? "," : ""}`);
    }
    lines.push(") {}");
    await setUp(lines.join("\r\n"));

    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).toContain(
      "variable.parameter.function.rust",
    );

    const captures = await rawCaptures(3000, 3006);
    const parameters = captures.filter(
      (capture) => capture.name === "variable.parameter.function.rust",
    );
    expect(captures.length).toBeLessThanOrEqual(20);
    expect(parameters.length).toBe(6);
    expect(
      parameters.every(
        (capture) =>
          capture.node.startPosition.row >= 3000 && capture.node.startPosition.row < 3006,
      ),
    ).toBe(true);

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8").replaceAll("\r\n", "\n");
    expect(query).toContain(
      '(parameter\n  pattern: (_) @variable.parameter.function.rust\n  (#is? test.typeAt "parent.parent parameters"))',
    );
    expect(query).not.toContain("(parameters\n  (parameter");
  });

  it("keeps a large use list leaf-rooted with local tile captures", async () => {
    const lines = ["use root::{", "  self,"];
    for (let index = 0; index < 6000; index++) {
      lines.push(`  item_${index}${index < 5999 ? "," : ""}`);
    }
    lines.push("};");
    await setUp(lines.join("\r\n"));

    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).toContain(
      "keyword.control.rust",
    );

    const captures = await rawCaptures(3000, 3006);
    expect(captures.length).toBeLessThanOrEqual(24);
    expect(
      captures.every(
        (capture) =>
          capture.node.startPosition.row >= 3000 && capture.node.startPosition.row < 3006,
      ),
    ).toBe(true);

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(query).toContain('(#is? test.childOfType "use_list scoped_use_list")');
    expect(query).not.toMatch(/\((?:scoped_)?use_list\s+\(self\)/);
  });
});
