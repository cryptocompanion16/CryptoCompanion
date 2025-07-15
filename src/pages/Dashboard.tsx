import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  User,
  Calculator,
  RotateCcw,
  ArrowLeftRight,
  CheckSquare,
} from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function Dashboard() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [totalUsd, setTotalUsd] = useState(0);
  const [totalBtc, setTotalBtc] = useState(0);

  // ✅ Redirect to /auth if user logs out
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchPortfolio = async () => {
      const { data, error } = await supabase
        .from("user_portfolio")
        .select("*")
        .eq("user_id", user.id)
        .eq("isSelected", true);

      if (error) {
        console.error("Error loading portfolio", error);
        return;
      }

      const coins = data || [];
      const coinIds = coins
        .map((c) => c.coin_id)
        .filter(Boolean)
        .join(",");

      if (!coinIds) {
        console.warn("No valid coin_ids to fetch.");
        setTotalUsd(0);
        setTotalBtc(0);
        return;
      }

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds},bitcoin&vs_currencies=usd`
        );
        const prices = await res.json();

        let total = 0;

        coins.forEach((coin) => {
          const price = prices[coin.coin_id]?.usd || 0;
          total += price * coin.quantity;
        });

        setTotalUsd(total);
        const btcPrice = prices["bitcoin"]?.usd || 1;
        setTotalBtc(total / btcPrice);
      } catch (err) {
        console.error("Price fetch failed", err);
      }
    };

    fetchPortfolio();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No need to navigate — useEffect handles redirect
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Crypto Companion</h1>
        <button
          onClick={() => navigate("/profile")}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
        >
          <User className="w-6 h-6 text-black" />
        </button>
      </div>

      <Card
        className="tool-card bg-portfolio text-black mb-8 cursor-pointer"
        onClick={() => navigate("/portfolio")}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Portfolio:</h2>
            <div className="text-2xl font-bold">{totalUsd.toFixed(2)} USD</div>
            <div className="text-lg opacity-80">= {totalBtc.toFixed(6)} BTC</div>
          </div>
          <div className="text-4xl">
            <TrendingUp size={48} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          {
            name: "Position Calculator",
            icon: Calculator,
            route: "/position-calculator",
            color: "bg-position-calc",
          },
          {
            name: "Daily Compounding",
            icon: RotateCcw,
            route: "/daily-compounding",
            color: "bg-daily-compound",
          },
          {
            name: "Converter",
            icon: ArrowLeftRight,
            route: "/converter",
            color: "bg-converter",
          },
          {
            name: "To Do",
            icon: CheckSquare,
            route: "/todo",
            color: "bg-todo",
          },
        ].map((tool, idx) => (
          <Card
            key={idx}
            onClick={() => navigate(tool.route)}
            className={`tool-card text-black cursor-pointer ${tool.color}`}
          >
            <div className="flex flex-col items-center text-center">
              <tool.icon size={32} className="mb-3" />
              <h3 className="font-semibold text-sm">{tool.name}</h3>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
