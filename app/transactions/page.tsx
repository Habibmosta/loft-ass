"use client"

import { requireRole } from "@/lib/auth" // Keep requireRole for session
import { getTransactions, deleteTransaction } from "@/app/actions/transactions" // Import deleteTransaction
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react" // Import Trash icon
import Link from "next/link"
import { useRouter } from "next/navigation" // Import useRouter
import { useEffect, useState } from "react" // Import useEffect and useState
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Transaction } from "@/lib/types" // Import Transaction type

export default function TransactionsPage() {
  const router = useRouter()
  // Session is typically fetched server-side, but if this is a client component,
  // you might need to pass it as a prop or fetch it client-side.
  // For now, let's assume it's available or mock it for client-side development.
  // In a real app, you'd likely use a context or a client-side fetch for user session.
  const session = { user: { role: "admin" } }; // Mock session for client-side debugging

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions()
      // Manually map to ensure all Transaction properties are present and correctly typed
      const mappedData: Transaction[] = data.map((item: Record<string, any>) => ({ // Explicitly type item
        id: item.id,
        amount: parseFloat(item.amount), // Ensure amount is number
        description: item.description,
        transaction_type: item.transaction_type as 'income' | 'expense',
        status: item.status as 'pending' | 'completed' | 'failed',
        date: new Date(item.date), // Ensure date is Date object
        category: item.category,
        loft_id: item.loft_id,
        user_id: item.user_id,
        currency_id: item.currency_id,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));
      setTransactions(mappedData)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      fetchTransactions() // Re-fetch transactions after deletion
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    }
  }

  if (loading) {
    return <div>Loading transactions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your financial transactions</p>
        </div>
        {session.user.role === "admin" && (
          <Button asChild>
            <Link href="/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{transaction.description}</CardTitle>
                  <CardDescription>{new Date(transaction.date).toLocaleDateString()}</CardDescription>
                </div>
                <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className={`font-medium ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/transactions/${transaction.id}`}>View</Link>
                </Button>
                {/* Only admin can edit or delete */}
                {session.user.role === "admin" && (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/transactions/${transaction.id}/edit`}>Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            transaction and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
