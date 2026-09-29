import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const transactions = [
  {
    description: "TechCorp payment",
    subtitle: "INV-2024-031 • Flutterwave",
    category: "CLIENT_REVENUE",
    date: "Nov 11, 2024",
    amount: 500000,
    balance: 300000,
  },
  {
    description: "Owner salary transfer",
    subtitle: "Business → Personal",
    category: "TRANSFER",
    date: "Nov 11, 2024",
    amount: -300000,
    balance: 200000,
  },
  {
    description: "Adobe Creative Cloud",
    subtitle: "Auto-debit • Monthly",
    category: "SUBSCRIPTION",
    date: "Nov 8, 2024",
    amount: -15400,
    balance: 500000,
  },
  {
    description: "Uber Lagos — 3 trips",
    subtitle: "Transportation",
    category: "TRANSPORT",
    date: "Nov 7, 2024",
    amount: -4200,
    balance: 515400,
  },
];

const badgeStyles = {
  CLIENT_REVENUE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  TRANSFER: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  SUBSCRIPTION: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  TRANSPORT: "bg-orange-100 text-orange-700 hover:bg-orange-100",
};

export default function RecentTransactions() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Recent Transactions
        </CardTitle>

        <Button variant="outline" size="sm" className="rounded-full">
          See all
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Balance After
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.description}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {transaction.subtitle}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                    <Badge
                      className={
                        badgeStyles[
                          transaction.category as keyof typeof badgeStyles
                        ]
                      }
                    >
                      {transaction.category.replace("_", " ")}
                    </Badge>
                    <span className="md:hidden">{transaction.date}</span>
                  </div>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <Badge
                    className={
                      badgeStyles[
                        transaction.category as keyof typeof badgeStyles
                      ]
                    }
                  >
                    {transaction.category.replace("_", " ")}
                  </Badge>
                </TableCell>

                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {transaction.date}
                </TableCell>

                <TableCell
                  className={`text-right font-semibold ${
                    transaction.amount > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : "-"}₦
                  {Math.abs(transaction.amount).toLocaleString()}
                </TableCell>

                <TableCell className="hidden text-right font-medium sm:table-cell">
                  ₦{transaction.balance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
