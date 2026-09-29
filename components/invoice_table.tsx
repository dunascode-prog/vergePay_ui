import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Invoice {
  id: string;
  client: string;
  description: string;
  issued: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Sent" | "Draft" | "Overdue";
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>

              <TableCell>{invoice.client}</TableCell>

              <TableCell>{invoice.description}</TableCell>

              <TableCell>{invoice.issued}</TableCell>

              <TableCell>{invoice.dueDate}</TableCell>

              <TableCell className="text-right font-semibold">
                ₦{invoice.amount.toLocaleString()}
              </TableCell>

              <TableCell>
                <Badge variant="outline">{invoice.status}</Badge>
              </TableCell>

              <TableCell className="text-right">
                <Button variant="ghost" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
