import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Mail, Smartphone } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect external services to your practice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Stripe
              </CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <CardDescription>
              Accept online payments and store cards on file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Connect Stripe</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Square
              </CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <CardDescription>
              Accept in-person tap and chip payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Connect Square</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Google Calendar
              </CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <CardDescription>
              Two-way sync appointments with Google Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Connect Google Calendar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Resend
              </CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <CardDescription>
              Send transactional emails and marketing campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Connect Resend</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
