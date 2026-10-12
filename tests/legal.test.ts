import { getLegalDoc, isLegalSlug, LEGAL_PAGES, parseFrontMatter, renderLegalMarkdown } from "@/lib/legal";
import { headingId } from "@/lib/text";

describe("headingId", () => {
  it("folds Turkish characters and punctuation", () => {
    expect(headingId("Veri sorumlusunun kimliği")).toBe("veri-sorumlusunun-kimligi");
    expect(headingId("İlgili kişinin hakları (KVKK m. 11)")).toBe("ilgili-kisinin-haklari-kvkk-m-11");
    expect(headingId("Who we are")).toBe("who-we-are");
  });
});

describe("parseFrontMatter", () => {
  it("reads key: value pairs and strips the block", () => {
    const { meta, body } = parseFrontMatter("---\ntitle: A: B\nlang: tr\n---\n\n# Body");
    expect(meta).toEqual({ title: "A: B", lang: "tr" });
    expect(body.trim()).toBe("# Body");
  });
  it("handles CRLF files and files without front matter", () => {
    expect(parseFrontMatter("---\r\ntitle: X\r\n---\r\nBody").meta.title).toBe("X");
    expect(parseFrontMatter("Just text").body).toBe("Just text");
  });
});

describe("renderLegalMarkdown", () => {
  it("gives every ## heading an id and builds the TOC, de-duplicating ids", () => {
    const { html, toc } = renderLegalMarkdown("## One\n\nText **bold**\n\n## One\n\n- a\n- b");
    expect(toc).toEqual([
      { id: "one", title: "One" },
      { id: "one-2", title: "One" },
    ]);
    expect(html).toContain('<h2 id="one">One</h2>');
    expect(html).toContain('<h2 id="one-2">One</h2>');
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>a</li>");
  });
  it("renders GFM tables", () => {
    expect(renderLegalMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |").html).toContain("<table>");
  });
});

describe.each(LEGAL_PAGES)("legal page %s", (slug) => {
  const doc = getLegalDoc(slug)!;
  it("exists with title, date, summary and a table of contents", () => {
    expect(doc).not.toBeNull();
    expect(doc.title.length).toBeGreaterThan(3);
    expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc.summary.length).toBeGreaterThan(10);
    expect(doc.toc.length).toBeGreaterThanOrEqual(2);
  });
  it("only links to pages that exist", () => {
    const hrefs = [...doc.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith("/legal/"));
    for (const h of hrefs) expect(isLegalSlug(h.replace("/legal/", ""))).toBe(true);
  });
});

describe("KVKK notice", () => {
  const doc = getLegalDoc("kvkk")!;
  it("is in Turkish", () => expect(doc.lang).toBe("tr"));
  it("covers the five headings KVKK art. 10 requires", () => {
    const titles = doc.toc.map((t) => t.title.toLowerCase()).join(" | ");
    for (const needle of ["veri sorumlusu", "amaç", "aktarıl", "toplama yöntemi", "hakları"]) {
      expect(titles).toContain(needle);
    }
  });
});

describe("getLegalDoc", () => {
  it("rejects unknown slugs", () => {
    expect(getLegalDoc("secret")).toBeNull();
    expect(getLegalDoc("../../package")).toBeNull();
  });
});
