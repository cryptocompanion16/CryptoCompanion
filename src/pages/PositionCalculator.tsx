import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CalculationResult {
  targetPrice: number;
  expectedProfit: number;
  investment: number;
  leverage: number;
  positionType: string;
  openPrice: number;
  totalPositionSize: number;
}

const PositionCalculator = () => {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState({
    investment: "",
    leverage: "",
    positionType: "",
    openPrice: "",
    hasClosePrice: "",
    closePrice: "",
    requiredProfit: "",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculatePosition = () => {
    const investment = parseFloat(formData.investment);
    const leverage = parseFloat(formData.leverage);
    const openPrice = parseFloat(formData.openPrice);
    const totalPositionSize = investment * leverage;

    let targetPrice: number;
    let expectedProfit: number;

    if (formData.hasClosePrice === "yes") {
      // Calculate profit based on close price
      const closePrice = parseFloat(formData.closePrice);
      const priceChange = Math.abs(closePrice - openPrice);
      expectedProfit = (priceChange / openPrice) * totalPositionSize;
      targetPrice = closePrice;
    } else {
      // Calculate target price based on required profit
      const requiredProfit = parseFloat(formData.requiredProfit);
      const priceChangePercent = requiredProfit / totalPositionSize;

      if (formData.positionType === "long") {
        targetPrice = openPrice * (1 + priceChangePercent);
      } else {
        targetPrice = openPrice * (1 - priceChangePercent);
      }
      expectedProfit = requiredProfit;
    }

    const calculationResult: CalculationResult = {
      targetPrice,
      expectedProfit,
      investment,
      leverage,
      positionType: formData.positionType,
      openPrice,
      totalPositionSize,
    };

    setResult(calculationResult);
    setShowResult(true);
  };

  const resetCalculator = () => {
    setShowResult(false);
    setFormData({
      investment: "",
      leverage: "",
      positionType: "",
      openPrice: "",
      hasClosePrice: "",
      closePrice: "",
      requiredProfit: "",
    });
    setResult(null);
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Position Result
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <Card className="tool-card bg-position-calc text-black mb-6">
          {/* Target Price */}
          <div className="border-2 border-black rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2">Target Price</h3>
            <div className="text-xl font-bold">
              ${result.targetPrice.toFixed(2)}
            </div>
          </div>

          {/* Expected Profit */}
          <div className="border-2 border-black rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-2">Expected Profit</h3>
            <div className="text-xl font-bold">
              ${result.expectedProfit.toFixed(2)}
            </div>
          </div>

          {/* Position Summary */}
          <div className="border-2 border-black rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">Position Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Investment</span>
                <span className="font-semibold">${result.investment}</span>
              </div>
              <div className="flex justify-between">
                <span>Leverage</span>
                <span className="font-semibold">{result.leverage}x</span>
              </div>
              <div className="flex justify-between">
                <span>Position Type</span>
                <span className="font-semibold capitalize">
                  {result.positionType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Open Price</span>
                <span className="font-semibold">${result.openPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Position Size</span>
                <span className="font-semibold">
                  ${result.totalPositionSize}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={resetCalculator}
          className="w-full h-12 rounded-full bg-white text-black font-semibold"
        >
          Calculate again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Position Calculator
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <Card className="tool-card bg-position-calc text-black">
        <div className="space-y-6">
          {/* Amount to Invest */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter amount to invest:
            </label>
            <Input
              type="number"
              value={formData.investment}
              onChange={(e) => handleInputChange("investment", e.target.value)}
              className="bg-position-calc/20 border-black text-black placeholder:text-black/60"
              placeholder="Enter amount"
            />
          </div>

          {/* Leverage and Position Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Leverage:
              </label>
              <Select
                onValueChange={(value) => handleInputChange("leverage", value)}
              >
                <SelectTrigger className="bg-position-calc/20 border-black text-black focus:outline-none focus:ring-0">
                  <SelectValue placeholder="Leverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                  <SelectItem value="20">20x</SelectItem>
                  <SelectItem value="50">50x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Position:
              </label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("positionType", value)
                }
              >
                <SelectTrigger className="bg-position-calc/20 border-black text-black focus:outline-none focus:ring-0">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Open Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Open Price:
            </label>
            <Input
              type="number"
              value={formData.openPrice}
              onChange={(e) => handleInputChange("openPrice", e.target.value)}
              className="bg-position-calc/20 border-black text-black placeholder:text-black/60 focus:outline-none focus:ring-0"
              placeholder="Enter open price"
            />
          </div>

          {/* Close Price Question */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have Close Price:
            </label>
            <Select
              onValueChange={(value) =>
                handleInputChange("hasClosePrice", value)
              }
            >
              <SelectTrigger className="bg-position-calc/20 border-black text-black focus:outline-none focus:ring-0">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Field */}
          {formData.hasClosePrice && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.hasClosePrice === "yes"
                  ? "Enter Close Price:"
                  : "Enter Required Profit:"}
              </label>
              <Input
                type="number"
                value={
                  formData.hasClosePrice === "yes"
                    ? formData.closePrice
                    : formData.requiredProfit
                }
                onChange={(e) =>
                  handleInputChange(
                    formData.hasClosePrice === "yes"
                      ? "closePrice"
                      : "requiredProfit",
                    e.target.value
                  )
                }
                className="bg-position-calc/20 border-black text-black placeholder:text-black/60 focus:outline-none focus:ring-0"
                placeholder={
                  formData.hasClosePrice === "yes"
                    ? "Enter close price"
                    : "Enter required profit"
                }
              />
            </div>
          )}

          {/* Calculate Button */}
          <Button
            onClick={calculatePosition}
            disabled={
              !formData.investment ||
              !formData.leverage ||
              !formData.positionType ||
              !formData.openPrice ||
              !formData.hasClosePrice ||
              (formData.hasClosePrice === "yes" && !formData.closePrice) ||
              (formData.hasClosePrice === "no" && !formData.requiredProfit)
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

export default PositionCalculator;
