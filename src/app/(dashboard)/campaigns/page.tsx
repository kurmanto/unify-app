import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Mail, Send, Clock, CheckCircle } from "lucide-react";

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Mail }
> = {
  draft: { variant: "outline", icon: Mail },
  scheduled: { variant: "secondary", icon: Clock },
  sending: { variant: "default", icon: Send },
  sent: { variant: "default", icon: CheckCircle },
  cancelled: { variant: "destructive", icon: Mail },
};

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {(!campaigns || campaigns.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first email campaign to engage with clients.
            </p>
            <Button asChild>
              <Link href="/campaigns/new">Create Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const config = statusConfig[campaign.status] || statusConfig.draft;
            return (
              <Card key={campaign.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {campaign.subject}
                      </CardTitle>
                      <CardDescription>
                        Created{" "}
                        {new Date(campaign.created_at).toLocaleDateString("en-CA")}
                        {campaign.sent_at &&
                          ` — Sent ${new Date(campaign.sent_at).toLocaleDateString("en-CA")}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{campaign.status}</Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {campaign.segment_tags.length > 0 && (
                  <CardContent>
                    <div className="flex gap-1">
                      <span className="text-xs text-muted-foreground mr-1">
                        Segments:
                      </span>
                      {campaign.segment_tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
