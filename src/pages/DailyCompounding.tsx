import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";

interface CompoundResult {
  days: number;
  finalAmount: number;
  dailyBreakdown: Array<{ day: number; amount: number }>;
  startingAmount: number;
  targetAmount: number;
  dailyRate: number;
}

const DailyCompounding = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();

  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState({
    startingAmount: "",
    targetAmount: "",
    dailyRate: "",
  });

  const [result, setResult] = useState<CompoundResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateCompounding = () => {
    const start = parseFloat(formData.startingAmount);
    const target = parseFloat(formData.targetAmount);
    const rate = parseFloat(formData.dailyRate);

    let amount = start;
    let days = 0;
    const breakdown: Array<{ day: number; amount: number }> = [];

    while (amount < target && days < 365) {
      amount = amount * (1 + rate / 100);
      days++;
      breakdown.push({ day: days, amount });
    }

    const compoundResult: CompoundResult = {
      days,
      finalAmount: amount,
      dailyBreakdown: breakdown,
      startingAmount: start,
      targetAmount: target,
      dailyRate: rate,
    };

    setResult(compoundResult);
    setShowResult(true);
  };

  const resetCalculator = () => {
    setShowResult(false);
    setFormData({
      startingAmount: "",
      targetAmount: "",
      dailyRate: "",
    });
    setResult(null);
  };

  const addToTodoList = async () => {
    if (!user || !result) return;

    const textArray = result.dailyBreakdown.map(
      (day) =>
        `Day - ${day.day}: ${day.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
    );

    const completedArray = result.dailyBreakdown.map(() => false);

    const { error } = await supabase.from("user_todos").insert({
      user_id: user.id,
      text: textArray,
      completed: completedArray,
      type: "plan",
    });

    if (error) {
      console.error("Failed to add to To-Do:", error);
    } else {
      navigate("/todo");
    }
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Daily Compounding</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <Card className="tool-card bg-daily-compound text-black mb-6">
          <div className="border-2 border-black rounded-lg p-4 mb-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold">
                Target: {result.targetAmount.toLocaleString()}
              </div>
              <div className="text-sm">Days: {result.days}</div>
            </div>
            <button onClick={addToTodoList} className="p-2 rounded" title="Add to To-Do">
              <CheckSquare size={24} />
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {result.dailyBreakdown.slice(0, 30).map((day) => (
              <div key={day.day} className="border-2 border-black rounded-lg p-3">
                <div className="font-semibold">
                  Day - {day.day}:{" "}
                  {day.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
            {result.dailyBreakdown.length > 30 && (
              <div className="text-center text-sm opacity-70 py-2">
                ... and {result.dailyBreakdown.length - 30} more days
              </div>
            )}
          </div>
        </Card>

        <Button
          onClick={resetCalculator}
          className="w-full h-12 rounded-full bg-white text-black font-semibold mb-4"
        >
          Calculate again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Daily Compounding</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <Card className="tool-card bg-daily-compound text-black">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Enter Starting Amount:</label>
            <Input
              type="number"
              value={formData.startingAmount}
              onChange={(e) => handleInputChange("startingAmount", e.target.value)}
              className="bg-daily-compound/20 border-black text-black placeholder:text-black/60"
              placeholder="Starting amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Enter Target Amount:</label>
            <Input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => handleInputChange("targetAmount", e.target.value)}
              className="bg-daily-compound/20 border-black text-black placeholder:text-black/60"
              placeholder="Target amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Enter Daily Return Rate (%):</label>
            <Input
              type="number"
              step="0.1"
              value={formData.dailyRate}
              onChange={(e) => handleInputChange("dailyRate", e.target.value)}
              className="bg-daily-compound/20 border-black text-black placeholder:text-black/60"
              placeholder="Daily return rate"
            />
          </div>

          <Button
            onClick={calculateCompounding}
            disabled={
              !formData.startingAmount || !formData.targetAmount || !formData.dailyRate
            }
            className="w-full h-12 rounded-full bg-white text-black font-semibold disabled:opacity-50"
          >
            Calculate
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DailyCompounding;
