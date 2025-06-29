"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Currency } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export const getColumns = (onSetDefault: (id: string) => Promise<void>): ColumnDef<Currency>[] => {
  return [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "symbol",
      header: "Symbol",
    },
    {
      accessorKey: "decimalDigits",
      header: "Decimals",
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) => {
        console.log(`Currency ${row.original.code} isDefault:`, row.original.isDefault); // Debugging log
        return (row.original.isDefault ? "Yes" : "No");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const currency = row.original
        const router = useRouter()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(currency.id)}
              >
                Copy currency ID
              </DropdownMenuItem>
              <DropdownMenuItem>Edit currency</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetDefault(currency.id)}>Set as default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
