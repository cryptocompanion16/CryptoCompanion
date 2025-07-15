import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ArrowUpDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  price: number;
  icon: string;
}

const Converter = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('1');
  const [fromCrypto, setFromCrypto] = useState<CryptoOption | null>(null);
  const [toCrypto, setToCrypto] = useState<CryptoOption | null>(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [showFromSearch, setShowFromSearch] = useState(false);
  const [showToSearch, setShowToSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCoins, setAllCoins] = useState<CryptoOption[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CryptoOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllCoins = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1'
        );
        const data = await res.json();
        const coins: CryptoOption[] = data
          .filter((coin: any) => /^[a-zA-Z]+$/.test(coin.symbol))
          .map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            icon: coin.image
          }));
        setAllCoins(coins);
        setFilteredCoins(coins);
      } catch (err) {
        console.error('Failed to fetch coin list:', err);
      }
      setLoading(false);
    };
    fetchAllCoins();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredCoins(allCoins);
    } else {
      const filtered = allCoins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
      setFilteredCoins(filtered);
    }
  }, [searchQuery, allCoins]);

  useEffect(() => {
    if (fromCrypto && toCrypto) {
      const amt = parseFloat(amount) || 0;
      setConvertedAmount((amt * fromCrypto.price) / toCrypto.price);
    }
  }, [amount, fromCrypto, toCrypto]);

  useEffect(() => {
    if (allCoins.length > 0) {
      const btc = allCoins.find((c) => c.id === 'bitcoin');
      const usdt = allCoins.find((c) => c.id === 'tether');
      if (btc && usdt) {
        setFromCrypto(btc);
        setToCrypto(usdt);
      }
    }
  }, [allCoins]);

  const handleSelectCoin = (coin: CryptoOption) => {
    if (showFromSearch) setFromCrypto(coin);
    else setToCrypto(coin);
    setShowFromSearch(false);
    setShowToSearch(false);
    setSearchQuery('');
  };

  const swapCryptos = () => {
    if (fromCrypto && toCrypto) {
      setFromCrypto(toCrypto);
      setToCrypto(fromCrypto);
    }
  };

  const handleNumberPad = (num: string) => {
    if (num === 'clear') {
      setAmount('0');
    } else if (num === '.') {
      if (!amount.includes('.')) setAmount(amount + '.');
    } else {
      setAmount(amount === '0' ? num : amount + num);
    }
  };

  if (showFromSearch || showToSearch) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Converter</h1>
          <button
            onClick={() => {
              setShowFromSearch(false);
              setShowToSearch(false);
              setSearchQuery('');
            }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <Card className="tool-card bg-[#bcf26b] text-black">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60" size={20} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a coin..."
              className="bg-[#bcf26b]/20 border-black/20 text-black pl-10 placeholder:text-black/60"
            />
          </div>

          {loading ? (
            <div className="text-center py-6">Loading coins...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCoins.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin)}
                  className="flex items-center p-3 border border-black/20 rounded-lg cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-3">
                    <img src={coin.icon} alt={coin.symbol} className="w-5 h-5 object-contain rounded-full" />
                  </div>
                  <span className="font-semibold text-black">{coin.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background p-4 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Converter</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      <Card className="tool-card bg-[#bcf26b] text-black mb-4 flex-shrink-0">
        {fromCrypto && (
          <div
            className="flex items-center justify-between p-4 border border-black/20 rounded-lg cursor-pointer mb-4"
            onClick={() => setShowFromSearch(true)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-3">
                <img src={fromCrypto.icon} alt={fromCrypto.symbol} className="w-5 h-5 object-contain rounded-full" />
              </div>
              <span className="font-semibold text-lg">{fromCrypto.symbol}</span>
            </div>
            <span className="text-2xl font-bold">{amount}</span>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <button
            onClick={swapCryptos}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center"
          >
            <ArrowUpDown className="text-white" size={20} />
          </button>
        </div>

        {toCrypto && (
          <div
            className="flex items-center justify-between p-4 border border-black/20 rounded-lg cursor-pointer"
            onClick={() => setShowToSearch(true)}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mr-3">
                <img src={toCrypto.icon} alt={toCrypto.symbol} className="w-5 h-5 object-contain rounded-full" />
              </div>
              <span className="font-semibold text-lg">{toCrypto.symbol}</span>
            </div>
            <span className="text-2xl font-bold">
              {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8
              })}
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'clear'].map((num, index) => (
          <Button
            key={index}
            onClick={() => handleNumberPad(num)}
            className={`h-full min-h-[50px] text-xl font-semibold rounded-lg transition-none ${
              num === 'clear'
                ? 'bg-red-500 text-white hover:bg-red-500'
                : 'bg-[#bcf26b] text-black hover:bg-[#bcf26b]'
            }`}
          >
            {num === 'clear' ? '⌫' : num}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Converter;
