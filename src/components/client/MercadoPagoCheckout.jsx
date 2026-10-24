import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPhone } from '../../utils/formatters';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function MercadoPagoCheckout({ booking, shopInfo, onPaymentConfirmed, onCancel }) {
  const [paymentType, setPaymentType] = useState('pix'); // 'pix' or 'card'
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(booking.clientName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  // Simulated unique Pix Copia e Cola payload
  const pixPayload = `00020126580014br.gov.bcb.pix0136teubarber-${booking.id.toLowerCase()}520400005303986540${Number(booking.price).toFixed(2)}5802BR5917TEU BARBER STUDIO6013MONTES CLAROS62070503***6304`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateCardPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentConfirmed('Mercado Pago (Cartão Online)');
    }, 1800);
  };

  const handleSimulatePixPaid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentConfirmed('Mercado Pago (Pix Online)');
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#14161b] border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 animate-fadeIn">
      
      {/* Header with Mercado Pago Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#009ee3] flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="font-black text-white text-lg tracking-tighter">mp</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white">
                Mercado Pago
              </h3>
              <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Checkout Seguro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pagamento online do {shopInfo.name}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Total a pagar:</span>
          <span className="text-xl font-black text-sky-400 font-serif">
            {formatCurrency(booking.price)}
          </span>
        </div>
      </div>

      {/* Tabs: Pix vs Cartão */}
      <div className="grid grid-cols-2 gap-2 my-5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setPaymentType('pix')}
          className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
            paymentType === 'pix'
              ? 'bg-[#009ee3] text-slate-950 border-[#009ee3] font-black shadow-lg shadow-sky-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pix Instantâneo</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentType('card')}
          className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
            paymentType === 'card'
              ? 'bg-[#009ee3] text-slate-950 border-[#009ee3] font-black shadow-lg shadow-sky-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cartão de Crédito</span>
        </button>
      </div>

      {/* ================= PIX VIEW ================= */}
      {paymentType === 'pix' && (
        <div className="space-y-4 animate-fadeIn text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center">
            
            {/* Timer Banner */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Código válido por: {formatTimer(timeLeft)}</span>
            </div>

            {/* QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center my-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixPayload)}`}
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-slate-400 text-xs mt-2">
              Escaneie o QR Code com o aplicativo do seu banco ou copie a chave abaixo
            </p>
          </div>

          {/* Copia e Cola Input + Button */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">
              Pix Copia e Cola:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixPayload}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-slate-300 text-xs font-mono truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyPix}
                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#009ee3] hover:bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulatePixPaid}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Confirmando recebimento...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Já realizei o pagamento Pix</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= CREDIT CARD VIEW ================= */}
      {paymentType === 'card' && (
        <form onSubmit={handleSimulateCardPayment} className="space-y-3 animate-fadeIn text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Número do Cartão</label>
            <input
              type="text"
              required
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Nome Impresso no Cartão</label>
            <input
              type="text"
              required
              placeholder="Como aparece no cartão"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white uppercase focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Validade (MM/AA)</label>
              <input
                type="text"
                required
                placeholder="MM/AA"
                value={cardExpiry}
                onChange={e => setCardExpiry(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">CVV / CVC</label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="123"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white font-mono focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Parcelamento</label>
            <select
              value={installments}
              onChange={e => setInstallments(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 px-3 py-2.5 rounded-xl text-white focus:outline-none focus:border-sky-400"
            >
              <option value="1">1x de {formatCurrency(booking.price)} sem juros</option>
              <option value="2">2x de {formatCurrency(booking.price / 2)} sem juros</option>
              <option value="3">3x de {formatCurrency(booking.price / 3)} sem juros</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-[#009ee3] hover:bg-sky-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span>Processando pagamento...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pagar {formatCurrency(booking.price)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Cancel or Pay Later option */}
      <div className="mt-4 pt-3 border-t border-white/10 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Prefiro pagar no local na barbearia
        </button>
      </div>

    </div>
  );
}
