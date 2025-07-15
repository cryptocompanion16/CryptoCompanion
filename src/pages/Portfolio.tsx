import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { X, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface CoinData {
  coin_id: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  value: number;
  isSelected?: boolean;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [coins, setCoins] = useState<CoinData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [newCoin, setNewCoin] = useState({ name: "", quantity: "" });

const fetchPriceFromCoinGecko = async (coinName: string) => {
  try {
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${coinName}`
    );
    const searchData = await searchRes.json();
    const coin = searchData.coins?.[0];

    if (!coin?.id) {
      console.warn("Coin not found in search");
      return null;
    }

    const coinRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin.id}`
    );
    const coinData = await coinRes.json();

    return {
      id: coin.id,
      name: coinData.name,
      symbol: coinData.symbol,
      price: coinData.market_data.current_price.usd,
    };
  } catch (error) {
    console.error("Failed to fetch CoinGecko price", error);
    return null;
  }
};


  const handleAddCoin = async () => {
    const { name, quantity } = newCoin;
    const parsedQty = parseFloat(quantity);
    if (!name || isNaN(parsedQty) || !user) return alert("Fill in all fields correctly.");

    setLoading(true);
    const result = await fetchPriceFromCoinGecko(name);
    setLoading(false);

    if (!result || !result.id) {
  alert("Failed to fetch price or invalid coin.");
  return;
}


    const coin: CoinData = {
      coin_id: result.id,
      name: result.name,
      symbol: result.symbol,
      price: result.price,
      quantity: parsedQty,
      value: result.price * parsedQty,
      isSelected: true,
    };

    const { error } = await supabase.from("user_portfolio").upsert({
      user_id: user.id,
      coin_id: coin.coin_id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.price,
      quantity: coin.quantity,
      value: coin.value,
      isSelected: true,
    });

    if (!error) setCoins((prev) => [...prev, coin]);
    setNewCoin({ name: "", quantity: "" });
    setDialogOpen(false);
  };

  const toggleCoinSelection = async (coinId: string) => {
    const coin = coins.find((c) => c.coin_id === coinId);
    if (!coin || !user) return;

    const updated = { ...coin, isSelected: !coin.isSelected };
    setCoins((prev) =>
      prev.map((c) => (c.coin_id === coinId ? updated : c))
    );

    await supabase
      .from("user_portfolio")
      .update({ isSelected: updated.isSelected })
      .eq("user_id", user.id)
      .eq("coin_id", coinId);
  };

  const resetCoins = async () => {
    if (!user) return;
    const ok = confirm("Are you sure you want to reset your portfolio?");
    if (!ok) return;
    await supabase.from("user_portfolio").delete().eq("user_id", user.id);
    setCoins([]);
  };

  useEffect(() => {
    const fetchCoins = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_portfolio")
        .select("*")
        .eq("user_id", user.id);

      const updatedCoins = await Promise.all(
        (data || []).map(async (coin) => {
          try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.coin_id}&vs_currencies=usd`);
            const json = await res.json();
            const price = json[coin.coin_id]?.usd ?? coin.price;
            return {
              ...coin,
              price,
              value: price * coin.quantity,
            };
          } catch {
            return coin;
          }
        })
      );

      setCoins(updatedCoins);
      setLoadingScreen(false);
    };

    fetchCoins();
  }, [user]);

  useEffect(() => {
    const total = coins.filter(c => c.isSelected).reduce((sum, c) => sum + c.value, 0);
    setTotalValue(total);
  }, [coins]);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    const parts = price.toFixed(8).split(".");
    const after = parts[1];
    const leadingZeros = after.match(/^0+/)?.[0].length || 0;

    if (leadingZeros <= 2) return `$${price}`;
    const hex = after.substring(leadingZeros, 6);
    return (
      <span>
        $0.
        <span className="text-gray-500">0x{leadingZeros}</span>
        {hex}
      </span>
    );
  };

  if (loadingScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-black text-white">Loading Portfolio...</div>;
  }
  const formatCompact = (num: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>

        <button onClick={() => navigate("/dashboard?updated=true")} className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <X className="w-5 h-5 text-black"/>
        </button>
        
      </div>

      <Card className="bg-portfolio text-black p-4 text-center mb-6">
        <h2 className="text-lg font-semibold">Total:</h2>
        <div className="text-3xl font-bold">{totalValue.toFixed(2)} USD</div>
      </Card>

      <div className="text-center mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)} className="bg-white text-black rounded-full">
              <Plus className="mr-2" /> Add Coin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add Coin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Coin Name</Label>
              <Input
                value={newCoin.name}
                onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })}
                placeholder="Bitcoin"
              />
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newCoin.quantity}
                onChange={(e) => setNewCoin({ ...newCoin, quantity: e.target.value })}
                placeholder="0.5"
              />
              <Button onClick={handleAddCoin} disabled={loading}>
                {loading ? "Adding..." : "Add Coin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {coins.map((coin) => (
          <Card
            key={coin.coin_id}
            className={`p-4 border-2 transition-all ${
              coin.isSelected ? "bg-portfolio text-black" : "bg-card"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <button
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    coin.isSelected ? "bg-black text-white" : "border-muted"
                  }`}
                  onClick={() => toggleCoinSelection(coin.coin_id)}
                >
                  {coin.isSelected && <Check size={16} />}
                </button>
                <span className="text-lg font-semibold">{coin.symbol}</span>
              </div>
              <div className="grid grid-cols-3 text-sm text-center gap-3">
                <div>
                  <div className="opacity-60 text-xs">Price</div>
                  <div>{formatPrice(coin.price)}</div>
                </div>
                <div>
                  <div className="opacity-60 text-xs">Qty</div>
                  <div>{formatCompact(coin.quantity)}</div>
                </div>
                <div>
                  <div className="opacity-60 text-xs">Value</div>
                  <div>${coin.value.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {coins.length > 0 && (
        <Button variant="destructive" className="w-full mt-6" onClick={resetCoins}>
          Reset Portfolio
        </Button>
      )}
    </div>
  );
};

export default Portfolio;
