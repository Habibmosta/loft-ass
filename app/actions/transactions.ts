"use server"

import { requireRole } from "@/lib/auth"
import { sql, ensureSchema } from "@/lib/database"
import { redirect } from "next/navigation"
import { transactionSchema, Transaction } from "@/lib/validations" // Import Transaction directly from validations

export async function getTransactions(): Promise<Transaction[]> {
  await ensureSchema()
  if (!sql) {
    return []
  }
  const transactions = await sql`SELECT * FROM transactions ORDER BY date DESC`
  return transactions as Transaction[]
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  await ensureSchema()
  if (!sql) {
    return null
  }
  try {
    const result = await sql`
      SELECT * FROM transactions WHERE id = ${id}
    `
    return (result[0] as Transaction) || null
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

export async function createTransaction(data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  if (!sql) {
    throw new Error("Database not initialized")
  }

  try {
    const result = await sql`
      INSERT INTO transactions (
        amount,
        transaction_type,
        status,
        description,
        date,
        category,
        currency_id,
        loft_id
      ) VALUES (
        ${validatedData.amount},
        ${validatedData.transaction_type},
        ${validatedData.status},
        ${validatedData.description},
        ${validatedData.date},
        ${validatedData.category},
        ${validatedData.currency_id || null},
        ${validatedData.loft_id || null}
      )
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to create transaction")
    }

    console.log("Successfully created transaction with ID:", result[0].id)
    redirect("/transactions")
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error creating transaction:", error)
    throw error
  }
}

export async function updateTransaction(id: string, data: unknown) {
  const session = await requireRole(["admin", "manager"])
  await ensureSchema()

  const validatedData = transactionSchema.parse(data)

  if (!sql) {
    throw new Error("Database not initialized")
  }

  try {
    const result = await sql`
      UPDATE transactions SET
        amount = ${validatedData.amount},
        transaction_type = ${validatedData.transaction_type},
        status = ${validatedData.status},
        description = ${validatedData.description},
        date = ${validatedData.date},
        category = ${validatedData.category},
        currency_id = ${validatedData.currency_id || null},
        loft_id = ${validatedData.loft_id || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || !result[0]?.id) {
      throw new Error("Failed to update transaction")
    }

    redirect(`/transactions/${id}`)
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error updating transaction:", error)
    throw error
  }
}

export async function deleteTransaction(id: string) {
  const session = await requireRole(["admin"])
  await ensureSchema()

  if (!sql) {
    throw new Error("Database not initialized")
  }

  try {
    await sql`DELETE FROM transactions WHERE id = ${id}`
    redirect("/transactions")
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error deleting transaction:", error)
    throw error
  }
}
