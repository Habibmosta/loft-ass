"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string().min(2),
  symbol: z.string().min(1).max(3),
  decimalDigits: z.number().min(0).max(8),
  isDefault: z.boolean().default(false),
  ratio: z.number().min(0).default(1.0),
})

export default function NewCurrencyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      decimalDigits: 2,
      isDefault: false,
      ratio: 1.0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/currencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create currency")

      toast({
        title: "Success",
        description: "Currency created successfully",
      })
      router.push("/settings/currencies")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create currency",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create New Currency</h3>
        <p className="text-sm text-muted-foreground">
          Add a new currency to use in transactions
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Code</FormLabel>
                <FormControl>
                  <Input placeholder="USD, EUR, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency Name</FormLabel>
                <FormControl>
                  <Input placeholder="US Dollar, Euro, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="decimalDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decimal Digits</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="8"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Rate Ratio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.00000001"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Currency</Button>
        </form>
      </Form>
    </div>
  )
}
