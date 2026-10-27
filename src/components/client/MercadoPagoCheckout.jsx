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
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Lock,
  Trash2,
  X
} from 'lucide-react';

export default function MercadoPagoCheckout({ booking, shopInfo, initialPaymentType = 'wallet', onPaymentConfirmed, onCancel }) {
  // Device detection: Apple Pay (iPhone/iPad/Mac Safari) vs Google Pay / Digital Wallet
  const isAppleDevice = typeof navigator !== 'undefined' && (
    /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) || 
    (typeof window !== 'undefined' && !!window.ApplePaySession)
  );

  const cleanPhone = (booking?.clientPhone || '').replace(/\D/g, '');
  const [paymentType, setPaymentType] = useState(initialPaymentType || 'wallet'); // 'wallet', 'pix', 'card'
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Saved cards for client phone / device
  const [savedCards, setSavedCards] = useState([]);
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(booking?.clientName || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  // Load saved cards for this client & device
  useEffect(() => {
    try {
      let cards = [];
      if (cleanPhone) {
        const storedByPhone = localStorage.getItem(`teu_saved_cards_${cleanPhone}`);
        if (storedByPhone) {
          const parsed = JSON.parse(storedByPhone);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cards = parsed;
          }
        }
      }
      if (cards.length === 0) {
        const storedGlobal = localStorage.getItem('teu_saved_cards');
        if (storedGlobal) {
          const parsed = JSON.parse(storedGlobal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cards = parsed;
          }
        }
      }
      if (cards.length > 0) {
        setSavedCards(cards);
      }
    } catch (e) {
      console.warn('Falha ao carregar cartões salvos:', e);
    }
  }, [cleanPhone]);

  const handleDeleteSavedCard = (cardId, e) => {
    e?.stopPropagation();
    const updated = savedCards.filter(c => c.id !== cardId);
    setSavedCards(updated);
    if (cleanPhone) {
      localStorage.setItem(`teu_saved_cards_${cleanPhone}`, JSON.stringify(updated));
    }
    localStorage.setItem('teu_saved_cards', JSON.stringify(updated));
  };

  const handlePayWithSavedCard = (card) => {
    setIsProcessing(true);
    setProcessingStatus(`Debitando no cartão final ${card.last4}...`);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentConfirmed(`Cartão Salvo •••• ${card.last4} (1-Toque)`);
    }, 1300);
  };

  // Simulated unique Pix Copia e Cola payload
  const bookingCode = (booking?.id || `TB-${Date.now().toString().slice(-5)}`).toLowerCase();
  const pixPayload = `00020126580014br.gov.bcb.pix0136teubarber-${bookingCode}520400005303986540${Number(booking?.price || 0).toFixed(2)}5802BR5917TEU BARBER STUDIO6013MONTES CLAROS62070503***6304`;

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

  const handlePayWithWallet = async () => {
    setIsProcessing(true);
    setProcessingStatus(isAppleDevice ? 'Autenticando com Face ID / Touch ID...' : 'Acessando Carteira Digital...');

    // Try native browser PaymentRequest if supported
    try {
      if (typeof window !== 'undefined' && window.PaymentRequest) {
        const supportedInstruments = [
          {
            supportedMethods: isAppleDevice ? 'https://apple.com/apple-pay' : 'basic-card',
            data: {
              supportedNetworks: ['visa', 'mastercard', 'elo', 'amex'],
              supportedTypes: ['credit', 'debit']
            }
          }
        ];

        const details = {
          total: {
            label: `Teu Barber Studio - ${booking.serviceName}`,
            amount: { currency: 'BRL', value: Number(booking.price).toFixed(2) }
          }
        };

        const request = new PaymentRequest(supportedInstruments, details);
        const canPay = await request.canMakePayment();
        if (canPay) {
          const paymentResponse = await request.show();
          await paymentResponse.complete('success');
          onPaymentConfirmed(isAppleDevice ? 'Apple Pay (Carteira do Celular)' : 'Google Pay (Carteira Digital)');
          return;
        }
      }
    } catch (e) {
      console.log('PaymentRequest fallback simulation', e);
    }

    // Biometric confirmation simulation
    setTimeout(() => {
      setProcessingStatus(isAppleDevice ? '✓ Face ID Aprovado com Sucesso!' : '✓ Pagamento Autorizado na Carteira!');
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentConfirmed(isAppleDevice ? 'Apple Pay (Carteira do Celular)' : 'Google Pay (Carteira Digital)');
      }, 700);
    }, 1400);
  };

  const handleSimulateCardPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (saveCardForFuture && cleanCard.length >= 13) {
      try {
        const last4 = cleanCard.slice(-4);
        const newCard = {
          id: Date.now().toString(),
          brand: 'Cartão de Crédito',
          last4,
          holder: cardHolder || booking?.clientName || 'Cliente',
          expiry: cardExpiry
        };
        const updated = [newCard, ...savedCards.filter(c => c.last4 !== last4)];
        setSavedCards(updated);
        if (cleanPhone) {
          localStorage.setItem(`teu_saved_cards_${cleanPhone}`, JSON.stringify(updated));
        }
        localStorage.setItem('teu_saved_cards', JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentConfirmed('Mercado Pago (Cartão Online)');
    }, 1600);
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

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total a pagar:</span>
            <span className="text-xl font-black text-sky-400 font-serif">
              {formatCurrency(booking.price)}
            </span>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Carteira Digital vs Pix vs Cartão */}
      <div className="grid grid-cols-3 gap-2 my-5 text-xs font-bold">
        {/* Tab 1: Carteira do Celular */}
        <button
          type="button"
          onClick={() => setPaymentType('wallet')}
          className={`py-3 px-2 sm:px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            paymentType === 'wallet'
              ? isAppleDevice 
                ? 'bg-black text-white border-white/40 shadow-lg shadow-black/80 font-black ring-2 ring-white/20' 
                : 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          {isAppleDevice ? (
            <>
              <span className="text-base leading-none"></span>
              <span className="truncate">Apple Pay</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span className="truncate">Carteira Digital</span>
            </>
          )}
        </button>

        {/* Tab 2: Pix */}
        <button
          type="button"
          onClick={() => setPaymentType('pix')}
          className={`py-3 px-2 sm:px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            paymentType === 'pix'
              ? 'bg-[#009ee3] text-slate-950 border-[#009ee3] font-black shadow-lg shadow-sky-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pix</span>
        </button>

        {/* Tab 3: Cartão de Crédito */}
        <button
          type="button"
          onClick={() => setPaymentType('card')}
          className={`py-3 px-2 sm:px-4 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            paymentType === 'card'
              ? 'bg-[#009ee3] text-slate-950 border-[#009ee3] font-black shadow-lg shadow-sky-500/20'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cartão</span>
        </button>
      </div>

      {/* ================= 1. CARTEIRA DIGITAL VIEW (APPLE PAY / GOOGLE PAY) ================= */}
      {paymentType === 'wallet' && (
        <div className="space-y-4 animate-fadeIn text-xs">
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 text-center space-y-3">
            
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
              {isAppleDevice ? (
                <span className="text-3xl leading-none"></span>
              ) : (
                <Smartphone className="w-7 h-7 text-amber-400" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                {isAppleDevice ? 'Apple Pay (Carteira do iPhone)' : 'Carteira Digital do Celular (Google Pay)'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                {isAppleDevice 
                  ? 'Pague com 1 toque seguro usando Face ID ou Touch ID com os cartões cadastrados na Carteira do seu iPhone.'
                  : 'Pague instantaneamente com 1 toque usando sua Carteira do Google ou cartão salvo no navegador.'}
              </p>
            </div>

            {/* Visual Security Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Tokenização Criptografada de Ponta a Ponta</span>
            </div>
          </div>

          {/* Action Button: Apple Pay or Google Pay */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayWithWallet}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isAppleDevice
                  ? 'bg-black hover:bg-zinc-900 border border-white/20 text-white shadow-black/80'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 normal-case font-bold">
                  <span className={`w-4 h-4 border-2 ${isAppleDevice ? 'border-white' : 'border-slate-950'} border-t-transparent rounded-full animate-spin`}></span>
                  <span>{processingStatus}</span>
                </div>
              ) : isAppleDevice ? (
                <div className="flex items-center gap-2 normal-case">
                  <span className="text-xl leading-none"></span>
                  <span>Pagar com Apple Pay • {formatCurrency(booking.price)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 normal-case">
                  <Smartphone className="w-4 h-4" />
                  <span>Pagar com Carteira Digital • {formatCurrency(booking.price)}</span>
                </div>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500">
            Não precisa digitar o número do cartão. A autenticação é feita diretamente pelo seu aparelho.
          </p>
        </div>
      )}

      {/* ================= 2. PIX VIEW ================= */}
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

      {/* ================= 3. CREDIT CARD VIEW ================= */}
      {paymentType === 'card' && (
        <div className="space-y-4 animate-fadeIn text-xs">
          {/* Saved Cards List (1-Click Payment) */}
          {savedCards.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Cartões Salvos no seu Aparelho
                </span>
                <span className="text-[10px] bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30 font-semibold">
                  1-Toque
                </span>
              </div>
              
              <div className="space-y-2">
                {savedCards.map(card => (
                  <div
                    key={card.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400/50 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                        💳
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white text-xs block">
                          •••• •••• •••• {card.last4}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {card.holder} {card.expiry ? `• Val: ${card.expiry}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handlePayWithSavedCard(card)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pagar 1-Toque
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedCard(card.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Excluir cartão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-[11px] text-slate-400 text-center border-t border-white/5 mt-2">
                Ou preencha um novo cartão abaixo:
              </div>
            </div>
          )}

          <form onSubmit={handleSimulateCardPayment} className="space-y-3">
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

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={saveCardForFuture}
                  onChange={e => setSaveCardForFuture(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">Salvar este cartão de forma segura no dispositivo para próximos agendamentos (1-Toque)</span>
              </label>
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
        </div>
      )}

    </div>
  );
}
