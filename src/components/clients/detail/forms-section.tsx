"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { IntakeForm } from "@/types";

interface FormsSectionProps {
  forms: IntakeForm[];
}

export function FormsSection({ forms }: FormsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Forms</CardTitle>
      </CardHeader>
      <CardContent>
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No forms submitted yet.
          </p>
        ) : (
          <div className="space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {form.form_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(form.created_at).toLocaleDateString("en-CA")}
                    </p>
                  </div>
                </div>
                <Badge variant={form.signed_at ? "default" : "outline"}>
                  {form.signed_at ? "Signed" : "Unsigned"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
