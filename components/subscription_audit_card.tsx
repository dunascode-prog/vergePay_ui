"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Lightbulb, CreditCard } from "lucide-react";

const subscriptions = [
  {
    name: "Adobe Creative Cloud",
    cost: "₦22,000",
    lastUsed: "52 days ago",
    linked: "Personal",
    active: false,
  },
  {
    name: "Notion Team",
    cost: "₦8,500",
    lastUsed: "49 days ago",
    linked: "Personal",
    active: false,
  },
  {
    name: "Figma Professional",
    cost: "₦9,800",
    lastUsed: "2 days ago",
    linked: "Business",
    active: true,
  },
  {
    name: "Netflix",
    cost: "₦4,400",
    lastUsed: "1 day ago",
    linked: "Personal",
    active: true,
  },
  {
    name: "Google One",
    cost: "₦2,900",
    lastUsed: "5 days ago",
    linked: "Business",
    active: true,
  },
];

export function SubscriptionAuditCard() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Subscription Audit — 11 Active
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Cost / Month</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Linked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.name} className="hover:bg-muted/40">
                <TableCell className="font-medium flex items-center gap-3">
                  {subscription.name}
                </TableCell>

                <TableCell>{subscription.cost}</TableCell>

                <TableCell className="text-muted-foreground">
                  {subscription.lastUsed}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      subscription.linked === "Business"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {subscription.linked}
                  </Badge>
                </TableCell>

                <TableCell>
                  {subscription.active ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Active use
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Unused • Business-linked
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Alert className="border-none bg-muted/40">
          <Lightbulb className="h-4 w-4 text-amber-500" />

          <AlertDescription className="leading-6">
            <strong>Adobe Creative Cloud</strong> and{" "}
            <strong>Notion Team</strong> haven&apos;t been used in more than{" "}
            <strong>45 days</strong>. Pausing or downgrading both could save
            approximately <strong>₦366,000 per year.</strong>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
