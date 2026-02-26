"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, DollarSign } from "lucide-react";
import type { Payment, Series } from "@/types";

interface PaymentHistoryProps {
  payments: Payment[];
  activeSeries: Series | null;
}

export function PaymentHistory({ payments, activeSeries }: PaymentHistoryProps) {
  const paidPayments = payments.filter((p) => p.status === "succeeded");
  const totalRevenue = paidPayments.reduce(
    (sum, p) => sum + p.amount_cents + p.tax_cents,
    0
  );
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const outstandingBalance = pendingPayments.reduce(
    (sum, p) => sum + p.amount_cents + p.tax_cents,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-lg font-bold">${(totalRevenue / 100).toFixed(2)}</p>
          </div>
          {outstandingBalance > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-amber-700">Outstanding</span>
              </div>
              <p className="text-lg font-bold text-amber-800">
                ${(outstandingBalance / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Series package status */}
        {activeSeries?.package_payment_id && (
          <div className="rounded-lg border p-3 flex items-center justify-between">
            <span className="text-sm">Ten Series Package</span>
            <Badge variant="default">Prepaid</Badge>
          </div>
        )}

        {/* Payment table */}
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No payments recorded yet.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Processor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {new Date(payment.created_at).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${((payment.amount_cents + payment.tax_cents) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {payment.processor}
                        {payment.card_last_four && ` \u2022\u2022\u2022\u2022 ${payment.card_last_four}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs badge-${payment.status === "succeeded" ? "paid" : payment.status}`}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
