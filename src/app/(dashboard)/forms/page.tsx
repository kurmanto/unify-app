import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Send } from "lucide-react";

export default async function FormsPage() {
  const supabase = await createClient();

  const { data: forms } = await supabase
    .from("intake_forms")
    .select("*, client:clients(first_name, last_name)")
    .order("created_at", { ascending: false });

  const formTemplates = [
    {
      name: "Intake Form",
      description: "Personal information and health history questionnaire",
      type: "intake",
    },
    {
      name: "Health History",
      description: "Detailed medical and health history",
      type: "health_history",
    },
    {
      name: "Informed Consent",
      description: "Treatment authorization and informed consent",
      type: "consent",
    },
    {
      name: "Cancellation Policy",
      description: "Cancellation policy acknowledgment",
      type: "cancellation_policy",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">Forms</h1>
        <p className="text-muted-foreground">
          Manage intake forms, waivers, and consent documents.
        </p>
      </div>

      {/* Form Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-heading">Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {formTemplates.map((template) => (
            <Card key={template.type} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  {template.name}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  <Send className="mr-2 h-3 w-3" />
                  Send to Client
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submitted Forms */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-heading">Submitted Forms</h2>
        <div className="rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!forms || forms.length === 0) ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No forms submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((form) => {
                  const client = form.client as Record<string, string>;
                  return (
                    <TableRow key={form.id} className="table-row-premium">
                      <TableCell className="font-medium">
                        {client?.first_name} {client?.last_name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {form.form_type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={form.signed_at ? "default" : "outline"}
                        >
                          {form.signed_at ? "Signed" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(form.created_at).toLocaleDateString("en-CA")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
