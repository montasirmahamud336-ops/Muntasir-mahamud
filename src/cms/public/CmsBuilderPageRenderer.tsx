import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import type { CmsBlock, CmsPage } from "@/cms/types";

const RenderButton = ({ block }: { block: CmsBlock }) => {
  const data = block.data as { text?: string; link?: string; variant?: "primary" | "outline"; newTab?: boolean };
  const text = data.text || "Click";
  const link = data.link || "/";
  const className = data.variant === "outline" ? "btn-outline" : "btn-primary";

  if (link.startsWith("/")) {
    return (
      <Link to={link}>
        <Button type="button" className={className}>
          {text}
        </Button>
      </Link>
    );
  }

  return (
    <a href={link} target={data.newTab ? "_blank" : "_self"} rel={data.newTab ? "noreferrer" : undefined}>
      <Button type="button" className={className}>
        {text}
      </Button>
    </a>
  );
};

const renderBlock = (block: CmsBlock) => {
  if (block.type === "heading") {
    const data = block.data as { text?: string; level?: 1 | 2 | 3 | 4 | 5 | 6; align?: "left" | "center" | "right" };
    const level = data.level || 2;
    const text = data.text || "";
    const alignClass = data.align === "center" ? "text-center" : data.align === "right" ? "text-right" : "text-left";

    switch (level) {
      case 1:
        return <h1 className={`text-4xl md:text-5xl font-bold ${alignClass}`}>{text}</h1>;
      case 2:
        return <h2 className={`text-3xl md:text-4xl font-bold ${alignClass}`}>{text}</h2>;
      case 3:
        return <h3 className={`text-2xl md:text-3xl font-semibold ${alignClass}`}>{text}</h3>;
      case 4:
        return <h4 className={`text-xl md:text-2xl font-semibold ${alignClass}`}>{text}</h4>;
      case 5:
        return <h5 className={`text-lg font-semibold ${alignClass}`}>{text}</h5>;
      default:
        return <h6 className={`text-base font-semibold ${alignClass}`}>{text}</h6>;
    }
  }

  if (block.type === "paragraph") {
    const data = block.data as { html?: string };
    return <div className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.html || "" }} />;
  }

  if (block.type === "image") {
    const data = block.data as { src?: string; alt?: string; caption?: string };
    if (!data.src) {
      return <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No image selected</div>;
    }

    return (
      <figure className="space-y-2">
        <img src={data.src} alt={data.alt || ""} className="w-full rounded-xl border border-border object-cover" loading="lazy" />
        {data.caption && <figcaption className="text-sm text-muted-foreground">{data.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "button") {
    return <RenderButton block={block} />;
  }

  const data = block.data as { html?: string };
  return <div dangerouslySetInnerHTML={{ __html: data.html || "" }} />;
};

export function CmsBuilderPageRenderer({ page }: { page: CmsPage }) {
  return (
    <Layout>
      <div className="pt-24">
        {page.content.sections.map((section) => (
          <section key={section.id} className="section">
            <div className="container mx-auto space-y-4">
              {section.rows.map((row) => (
                <div key={row.id} className="flex flex-wrap gap-6">
                  {row.columns.map((column) => (
                    <div key={column.id} style={{ flexBasis: `${(column.width / 12) * 100}%` }} className="min-w-[280px] flex-1 space-y-4">
                      {column.blocks.map((block) => (
                        <div key={block.id}>{renderBlock(block)}</div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}
