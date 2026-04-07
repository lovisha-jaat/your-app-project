import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/finance";
import { Plus, Trash2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [tab, setTab] = useState<"add" | "history">("add");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!category) { toast.error("Select a category"); return; }

    addTransaction.mutate(
      { type, amount: amt, category, description: description || null, transaction_date: date },
      {
        onSuccess: () => {
          toast.success(`${type === "income" ? "Income" : "Expense"} added! 🎉`);
          setAmount("");
          setCategory("");
          setDescription("");
        },
        onError: () => toast.error("Failed to add transaction"),
      }
    );
  };

  const filtered = transactions.filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (search && !t.category.toLowerCase().includes(search.toLowerCase()) && !(t.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card px-4 pt-6 pb-5 border-b border-border/40">
        <h1 className="text-xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">Add and manage your income & expenses</p>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "add" | "history")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="add" className="flex-1">Add New</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2">
              <Button variant={type === "expense" ? "default" : "outline"} className="flex-1" onClick={() => { setType("expense"); setCategory(""); }}>
                <TrendingDown className="w-4 h-4 mr-1.5" /> Expense
              </Button>
              <Button variant={type === "income" ? "default" : "outline"} className="flex-1" onClick={() => { setType("income"); setCategory(""); }}>
                <TrendingUp className="w-4 h-4 mr-1.5" /> Income
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm mb-1.5 block">Amount ($)</Label>
                <Input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="text-lg h-12" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Notes (optional)</Label>
                <Input placeholder="What was this for?" value={description} onChange={e => setDescription(e.target.value)} className="h-11" />
              </div>
              <Button onClick={handleAdd} className="w-full h-11 text-base font-semibold" disabled={addTransaction.isPending}>
                <Plus className="w-4 h-4 mr-1.5" /> Add {type === "income" ? "Income" : "Expense"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-28 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <Card className="shadow-sm"><CardContent className="p-8 text-center text-muted-foreground text-sm">No transactions found. Start by adding one!</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(t => (
                  <Card key={t.id} className="shadow-sm">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                        {t.type === "income" ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.category}</p>
                        <p className="text-xs text-muted-foreground">{t.description || format(new Date(t.transaction_date), "MMM d, yyyy")}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className={`text-sm font-bold tabular-nums ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                          {t.type === "income" ? "+" : "-"}${Number(t.amount).toLocaleString()}
                        </p>
                        <button onClick={() => deleteTransaction.mutate(t.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
