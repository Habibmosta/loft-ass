"use client"

import { CurrencyClient } from "./components/client"
import { useEffect, useState } from "react"
import { Currency } from "@/lib/types"

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/currencies")
      if (!response.ok) throw new Error("Failed to fetch currencies")
      const data = await response.json()
      setCurrencies(data)
    } catch (error) {
      console.error("Error fetching currencies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencies()
  }, [])

  if (loading) {
    return <div>Loading currencies...</div>
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch("/api/currencies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to set default currency");
      }

      // Re-fetch currencies to update the list
      await fetchCurrencies() // Await the re-fetch to ensure state is updated before re-render

    } catch (error) {
      console.error("Failed to set default currency:", error);
    }
  };

  console.log("Currencies passed to CurrencyClient:", currencies); // Debugging log

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CurrencyClient data={currencies} onSetDefault={handleSetDefault} />
    </div>
  )
}
