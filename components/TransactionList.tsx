'use client'
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, MoreVertical, Download, Eye, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  type: "income" | "expense";
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tr-1",
      description: "Amazon Purchase",
      category: "Shopping",
      amount: 42.99,
      date: "2025-04-08",
      status: "completed",
      type: "expense"
    },
    {
      id: "tr-2",
      description: "Salary Payment",
      category: "Income",
      amount: 3500.00,
      date: "2025-04-05",
      status: "completed",
      type: "income"
    },
    {
      id: "tr-3",
      description: "Grocery Store",
      category: "Food",
      amount: 87.25,
      date: "2025-04-03",
      status: "completed",
      type: "expense"
    },
    {
      id: "tr-4",
      description: "Client Payment",
      category: "Income",
      amount: 250.00,
      date: "2025-04-01",
      status: "completed",
      type: "income"
    },
    {
      id: "tr-5",
      description: "Utility Bill",
      category: "Bills",
      amount: 145.30,
      date: "2025-03-28",
      status: "pending",
      type: "expense"
    }
  ]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent financial activity</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-3.5 w-3.5" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="rounded-md border"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <motion.tr 
                  key={transaction.id} 
                  variants={item}
                  className="[&>td]:py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className="flex items-center">
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        transaction.status === "completed" 
                          ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
                          : transaction.status === "pending" 
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                      }
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </CardContent>
    </Card>
  );
}