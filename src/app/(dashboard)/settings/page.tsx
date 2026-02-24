import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, CreditCard, Link2, Settings as SettingsIcon } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">
          Manage your practice settings and integrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Practice Info
            </CardTitle>
            <CardDescription>
              Business name, contact info, timezone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span>{practitioner?.business_name || "Unify Rolfing"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{practitioner?.email || user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span>{practitioner?.timezone || "America/Toronto"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </CardTitle>
            <CardDescription>
              Working hours, buffer time, booking window.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/settings/schedule">Manage Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Services & Pricing
            </CardTitle>
            <CardDescription>
              Session types, prices, packages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/settings/services">Manage Services</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </CardTitle>
            <CardDescription>
              Stripe, Square, Google Calendar, Resend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/settings/integrations">Manage Integrations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
