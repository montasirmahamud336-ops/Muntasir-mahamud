import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getPageById,
  listMedia,
  listPages,
  updatePage,
  getMediaPublicUrl,
} from "@/cms/api";
import {
  createBlock,
  createColumn,
  createRow,
  createSection,
  emptyPageContent,
  type CmsBlock,
  type CmsBlockType,
  type CmsMedia,
  type CmsPage,
  type CmsPageContent,
} from "@/cms/types";
import { RichTextEditor } from "@/cms/components/RichTextEditor";

const blockTypes: CmsBlockType[] = ["heading", "paragraph", "image", "button", "html"];

export default function AdminPageBuilder() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [pages, setPages] = useState<CmsPage[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string>(pageId || "");
  const [content, setContent] = useState<CmsPageContent>(emptyPageContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((x) => x.id === currentPageId) || null,
    [pages, currentPageId],
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [pageList, mediaList] = await Promise.all([listPages(), listMedia()]);
      setPages(pageList);
      setMedia(mediaList);

      const targetId = pageId || currentPageId || pageList[0]?.id || "";
      if (!targetId) {
        setContent(emptyPageContent());
        return;
      }

      const page = await getPageById(targetId);
      if (!page) {
        setError("Page not found.");
        return;
      }

      setCurrentPageId(targetId);
      setContent(page.content || emptyPageContent());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load page builder.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const setSection = (sectionId: string, updater: (section: CmsPageContent["sections"][number]) => CmsPageContent["sections"][number]) => {
    setContent((prev) => ({
      sections: prev.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setContent((prev) => {
      const index = prev.sections.findIndex((section) => section.id === sectionId);
      if (index === -1) return prev;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.sections.length) return prev;

      const sections = [...prev.sections];
      const [current] = sections.splice(index, 1);
      sections.splice(target, 0, current);
      return { sections };
    });
  };

  const addSection = () => {
    setContent((prev) => ({
      sections: [...prev.sections, createSection(`Section ${prev.sections.length + 1}`)],
    }));
  };

  const removeSection = (sectionId: string) => {
    setContent((prev) => ({ sections: prev.sections.filter((section) => section.id !== sectionId) }));
  };

  const addRow = (sectionId: string) => {
    setSection(sectionId, (section) => ({ ...section, rows: [...section.rows, createRow()] }));
  };

  const removeRow = (sectionId: string, rowId: string) => {
    setSection(sectionId, (section) => ({ ...section, rows: section.rows.filter((row) => row.id !== rowId) }));
  };

  const addColumn = (sectionId: string, rowId: string) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        if (row.columns.length >= 4) return row;

        const width = Math.max(3, Math.floor(12 / (row.columns.length + 1)));
        const updatedColumns = row.columns.map((col) => ({ ...col, width }));
        return {
          ...row,
          columns: [...updatedColumns, createColumn(width)],
        };
      }),
    }));
  };

  const removeColumn = (sectionId: string, rowId: string, columnId: string) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        if (row.columns.length === 1) return row;
        return { ...row, columns: row.columns.filter((col) => col.id !== columnId) };
      }),
    }));
  };

  const updateColumnWidth = (sectionId: string, rowId: string, columnId: string, width: number) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => (col.id === columnId ? { ...col, width } : col)),
        };
      }),
    }));
  };

  const addBlock = (sectionId: string, rowId: string, columnId: string, type: CmsBlockType) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;
            return { ...col, blocks: [...col.blocks, createBlock(type)] };
          }),
        };
      }),
    }));
  };

  const removeBlock = (sectionId: string, rowId: string, columnId: string, blockId: string) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;
            return { ...col, blocks: col.blocks.filter((block) => block.id !== blockId) };
          }),
        };
      }),
    }));
  };

  const updateBlock = (
    sectionId: string,
    rowId: string,
    columnId: string,
    blockId: string,
    updater: (block: CmsBlock) => CmsBlock,
  ) => {
    setSection(sectionId, (section) => ({
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;
            return {
              ...col,
              blocks: col.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
            };
          }),
        };
      }),
    }));
  };

  const saveContent = async () => {
    if (!currentPageId) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updatePage(currentPageId, { content, use_builder: true });
      setMessage("Page builder content saved and now live.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save content.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onChangePage = async (targetId: string) => {
    setCurrentPageId(targetId);
    navigate(`/admin/page-builder/${targetId}`);

    const page = await getPageById(targetId);
    if (page) {
      setContent(page.content || emptyPageContent());
      setMessage(null);
      setError(null);
    }
  };

  if (loading) {
    return <p>Loading page builder...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Page Builder</h2>
          <p className="text-sm text-muted-foreground">Add sections, rows, columns, and content blocks.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={currentPageId}
            onChange={(e) => void onChangePage(e.target.value)}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title} ({page.slug})
              </option>
            ))}
          </select>
          <Button type="button" onClick={saveContent} disabled={!currentPageId || saving}>
            {saving ? "Saving..." : "Save Builder"}
          </Button>
        </div>
      </div>

      {selectedPage && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm">
              Editing: <span className="font-semibold">{selectedPage.title}</span> /{selectedPage.slug}
            </p>
          </CardContent>
        </Card>
      )}

      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-4">
        {content.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">Section {sectionIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => moveSection(section.id, "up")}>
                    Move Up
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => moveSection(section.id, "down")}>
                    Move Down
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeSection(section.id)}>
                    Remove Section
                  </Button>
                </div>
              </div>

              <Input
                value={section.name}
                onChange={(e) => setSection(section.id, (current) => ({ ...current, name: e.target.value }))}
                placeholder="Section Name"
              />
            </CardHeader>

            <CardContent className="space-y-4">
              {section.rows.map((row, rowIndex) => (
                <div key={row.id} className="rounded-lg border border-dashed border-border p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">Row {rowIndex + 1}</p>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => addColumn(section.id, row.id)}>
                        Add Column
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeRow(section.id, row.id)}>
                        Remove Row
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {row.columns.map((column) => (
                      <div
                        key={column.id}
                        className="min-w-[260px] flex-1 rounded-md border border-border bg-muted/30 p-3 space-y-3"
                        style={{ flexBasis: `${(column.width / 12) * 100}%` }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-medium">Column</p>
                          <div className="flex items-center gap-2">
                            <select
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              value={column.width}
                              onChange={(e) =>
                                updateColumnWidth(section.id, row.id, column.id, Number(e.target.value))
                              }
                            >
                              {[3, 4, 6, 8, 9, 12].map((value) => (
                                <option key={value} value={value}>
                                  {value}/12
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeColumn(section.id, row.id, column.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {blockTypes.map((type) => (
                            <Button
                              key={type}
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addBlock(section.id, row.id, column.id, type)}
                            >
                              + {type}
                            </Button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {column.blocks.map((block) => (
                            <div key={block.id} className="rounded-md border border-border bg-background p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium capitalize">{block.type}</p>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeBlock(section.id, row.id, column.id, block.id)}
                                >
                                  Remove Block
                                </Button>
                              </div>

                              {block.type === "heading" && (
                                <>
                                  <Input
                                    value={(block.data as { text: string }).text || ""}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: { ...current.data, text: e.target.value },
                                      }))
                                    }
                                    placeholder="Heading text"
                                  />
                                  <select
                                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    value={(block.data as { level: number }).level || 2}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: {
                                          ...current.data,
                                          level: Number(e.target.value),
                                        },
                                      }))
                                    }
                                  >
                                    {[1, 2, 3, 4, 5, 6].map((level) => (
                                      <option key={level} value={level}>
                                        H{level}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              )}

                              {block.type === "paragraph" && (
                                <RichTextEditor
                                  value={(block.data as { html: string }).html || ""}
                                  onChange={(html) =>
                                    updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                      ...current,
                                      data: { ...current.data, html },
                                    }))
                                  }
                                />
                              )}

                              {block.type === "image" && (
                                <div className="space-y-2">
                                  <select
                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                    value={(block.data as { mediaId?: string }).mediaId || ""}
                                    onChange={(e) => {
                                      const mediaItem = media.find((item) => item.id === e.target.value);
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: {
                                          ...current.data,
                                          mediaId: mediaItem?.id,
                                          src: mediaItem ? getMediaPublicUrl(mediaItem.storage_path) : "",
                                          alt: mediaItem?.alt_text || "",
                                        },
                                      }));
                                    }}
                                  >
                                    <option value="">Select from Media Library</option>
                                    {media.map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.file_name}
                                      </option>
                                    ))}
                                  </select>
                                  <Input
                                    placeholder="Image URL (optional override)"
                                    value={(block.data as { src?: string }).src || ""}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: { ...current.data, src: e.target.value },
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Alt text"
                                    value={(block.data as { alt?: string }).alt || ""}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: { ...current.data, alt: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                              )}

                              {block.type === "button" && (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Button text"
                                    value={(block.data as { text: string }).text || ""}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: { ...current.data, text: e.target.value },
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Button link"
                                    value={(block.data as { link: string }).link || ""}
                                    onChange={(e) =>
                                      updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                        ...current,
                                        data: { ...current.data, link: e.target.value },
                                      }))
                                    }
                                  />
                                  <label className="flex items-center gap-2 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={Boolean((block.data as { newTab?: boolean }).newTab)}
                                      onChange={(e) =>
                                        updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                          ...current,
                                          data: { ...current.data, newTab: e.target.checked },
                                        }))
                                      }
                                    />
                                    Open in new tab
                                  </label>
                                </div>
                              )}

                              {block.type === "html" && (
                                <Textarea
                                  rows={8}
                                  value={(block.data as { html: string }).html || ""}
                                  onChange={(e) =>
                                    updateBlock(section.id, row.id, column.id, block.id, (current) => ({
                                      ...current,
                                      data: { ...current.data, html: e.target.value },
                                    }))
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={() => addRow(section.id)}>
                + Add Row
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button type="button" onClick={addSection}>+ Add Section</Button>
      </div>
    </div>
  );
}
