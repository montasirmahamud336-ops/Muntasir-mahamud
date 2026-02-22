import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const run = (command: string) => {
  document.execCommand(command, false);
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => run("bold")}>B</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => run("italic")}>I</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => run("underline")}>U</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => run("insertUnorderedList")}>List</Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[120px] rounded-md border border-border bg-background p-3 text-sm"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || "<p></p>" }}
      />
    </div>
  );
}
