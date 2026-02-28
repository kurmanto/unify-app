"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Check } from "lucide-react";
import { SOAP_TEMPLATES, type SoapTemplate } from "@/lib/rolfing/soap-templates";
import type { FocusArea } from "@/types";

interface TemplateSelectorProps {
  sessionNumber: number | null;
  onApply: (template: SoapTemplate, overwrite: boolean) => void;
}

export function TemplateSelector({ sessionNumber, onApply }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<SoapTemplate | null>(null);

  if (!sessionNumber) return null;

  const template = SOAP_TEMPLATES.find((t) => t.session === sessionNumber);
  if (!template) return null;

  function apply(overwrite: boolean) {
    if (!template) return;
    onApply(template, overwrite);
    setOpen(false);
    setPreview(null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pre-fills SOAP fields with typical session data
          </p>
        </div>

        <div className="p-3 space-y-2 max-h-64 overflow-y-auto text-xs">
          <div>
            <p className="font-medium text-muted-foreground uppercase text-[10px] mb-1">Objective</p>
            <p className="text-muted-foreground line-clamp-3">{template.objective}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground uppercase text-[10px] mb-1">Assessment</p>
            <p className="text-muted-foreground line-clamp-3">{template.assessment}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground uppercase text-[10px] mb-1">Techniques</p>
            <div className="flex flex-wrap gap-1">
              {template.techniques.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-muted-foreground uppercase text-[10px] mb-1">Focus Areas</p>
            <div className="flex flex-wrap gap-1">
              {template.focus_areas.map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px]">
                  {a.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => apply(false)}
          >
            <Check className="h-3 w-3 mr-1" />
            Fill Empty Fields
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() => apply(true)}
          >
            Overwrite All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
