import { useState } from 'react';
import QRCode from 'qrcode';
import { AwardIcon, CheckCircleIcon, LockIcon } from '../../components/ui/icons';
import { useToast } from '../../contexts/ToastContext';
import { plans } from '../../data/landingContent';
import { subscriptionApi, type SubscriptionPlan } from '../../services/subscriptionApi';
import styles from './SubscriptionPage.module.css';

export function SubscriptionPage() {
  const { showToast } = useToast();
  const [method, setMethod] = useState<'credit' | 'debit' | 'pix'>('credit');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('VITALICIO');
  const [installments, setInstallments] = useState(1);
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const selectedPlanData = selectedPlan === 'BASICO' ? plans.basic : plans.lifetime;
  const totalInCents = Number(selectedPlanData.price.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.')) * 100;
  const installmentAmount = (totalInCents / installments / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const updateCard = (field: keyof typeof card, value: string) => {
    setCard((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (value: string) => value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
  const isValidCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 16) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (shouldDouble) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateCard = () => {
    const nextErrors: Record<string, string> = {};
    if (!isValidCardNumber(card.number)) nextErrors.number = 'Digite um número de cartão válido.';
    if (card.name.trim().length < 5) nextErrors.name = 'Informe o nome como está no cartão.';
    const [month, year] = card.expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    if (!month || month > 12 || !year || year < currentYear || (year === currentYear && month < currentDate.getMonth() + 1)) nextErrors.expiry = 'Informe uma validade futura.';
    if (!/^\d{3,4}$/.test(card.cvv)) nextErrors.cvv = 'CVV inválido.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (method !== 'pix' && !validateCard()) return;
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    if (method === 'pix') {
      const amount = selectedPlan === 'BASICO' ? '97.00' : '2997.99';
      const code = `00020126580014br.gov.bcb.pix0136oab-mentoria-${selectedPlan.toLowerCase()}5204000053039865405${amount}5802BR5920OAB Mentoria6009SAO PAULO62070503***6304A1B2`;
      setPixCode(code);
      setPixQrCode(await QRCode.toDataURL(code, { width: 220, margin: 1, color: { dark: '#0b1f3a', light: '#ffffff' } }));
    } else {
      showToast(`Pagamento no ${method === 'credit' ? 'crédito' : 'débito'} aprovado.`, 'success');
    }
    await subscriptionApi.activate(selectedPlan);
    setIsProcessing(false);
  };

  const copyPixCode = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    showToast('Código PIX copiado.', 'success');
    window.setTimeout(() => setCopied(false), 2500);
  };

  return <div className={styles.page}>
    <div className={styles.header}><p className={styles.eyebrow}>Minha conta</p><h1>Minha assinatura</h1><p className={styles.subtitle}>Escolha entre 90 dias de preparação ou acesso até sua aprovação.</p></div>
    <section className={styles.checkoutGrid}>
      <div className={styles.paymentPanel}>
        <div className={styles.panelHeading}><div><p className={styles.kicker}>Checkout seguro</p><h2>Como você quer pagar?</h2></div><LockIcon size={19} /></div>
        <div className={styles.methodTabs} role="tablist" aria-label="Plano de assinatura">
          {([['BASICO', 'Básico · 90 dias'], ['VITALICIO', 'Vitalício · até passar']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={selectedPlan === value} className={selectedPlan === value ? styles.methodActive : ''} onClick={() => { setSelectedPlan(value); setPixCode(''); }}>{label}</button>)}
        </div>
        <div className={styles.methodTabs} role="tablist" aria-label="Método de pagamento">
          {([['credit', 'Cartão de crédito'], ['debit', 'Cartão de débito'], ['pix', 'PIX']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={method === value} className={method === value ? styles.methodActive : ''} onClick={() => { setMethod(value); setPixCode(''); if (value !== 'credit') setInstallments(1); }}>{label}</button>)}
        </div>
        {pixCode ? <div className={styles.pixResult}><div><p className={styles.kicker}>PIX gerado</p><h3>Escaneie o QR Code para pagar</h3><p>Abra o app do seu banco, escaneie o código e confirme o pagamento.</p><button type="button" className={styles.copyButton} onClick={copyPixCode}>{copied ? 'Código copiado' : 'Copiar código copia e cola'}</button><code className={styles.pixCode}>{pixCode}</code></div><img src={pixQrCode} alt="QR Code para pagamento PIX" /></div> : method === 'pix' ? <div className={styles.pixInfo}><div className={styles.pixMark}>PIX</div><div><h3>Pagamento instantâneo</h3><p>O QR Code e o código copia e cola serão gerados ao continuar.</p></div></div> : <form className={styles.cardForm} onSubmit={handleSubmit} noValidate>
          <label>Número do cartão<input inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={(event) => updateCard('number', formatCardNumber(event.target.value))} placeholder="0000 0000 0000 0000" aria-invalid={Boolean(errors.number)} />{errors.number && <small>{errors.number}</small>}</label>
          <label>Nome no cartão<input autoComplete="cc-name" value={card.name} onChange={(event) => updateCard('name', event.target.value)} placeholder="Nome completo" aria-invalid={Boolean(errors.name)} />{errors.name && <small>{errors.name}</small>}</label>
          <div className={styles.inputRow}><label>Validade<input inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={(event) => updateCard('expiry', formatExpiry(event.target.value))} placeholder="MM/AA" aria-invalid={Boolean(errors.expiry)} />{errors.expiry && <small>{errors.expiry}</small>}</label><label>CVV<input inputMode="numeric" autoComplete="cc-csc" value={card.cvv} onChange={(event) => updateCard('cvv', event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" aria-invalid={Boolean(errors.cvv)} />{errors.cvv && <small>{errors.cvv}</small>}</label></div>
          {method === 'credit' && <label className={styles.installmentLabel}>Parcelamento<select value={installments} onChange={(event) => setInstallments(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}x de {(totalInCents / value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{value === 10 ? ' sem juros' : ''}</option>)}</select><small className={styles.installmentHint}>Até 10x sem juros no cartão de crédito.</small></label>}
          {method !== 'credit' && <p className={styles.paymentModeNote}>Pagamento à vista no {method === 'debit' ? 'débito' : 'PIX'}.</p>}
          <button className={styles.submitButton} type="submit" disabled={isProcessing}>{isProcessing ? 'Processando...' : `Pagar ${selectedPlanData.price}`}</button>
        </form>}
        {method === 'pix' && !pixCode && <button className={styles.submitButton} type="button" onClick={handleSubmit} disabled={isProcessing}>{isProcessing ? 'Gerando QR Code...' : `Gerar PIX de ${selectedPlanData.price}`}</button>}
        <p className={styles.secureNote}><LockIcon size={14} /> Seus dados são protegidos e não ficam armazenados.</p>
      </div>
      <aside className={styles.orderSummary}><p className={styles.kicker}>Resumo do pedido</p><h2>{selectedPlanData.name}</h2><p className={styles.summaryDescription}>{selectedPlanData.description}</p><ul>{selectedPlanData.features.slice(0, 5).map((feature) => <li key={feature}><CheckCircleIcon size={16} />{feature}</li>)}</ul><div className={styles.total}><span>Total hoje</span><strong>{selectedPlanData.price}<small>{selectedPlanData.period}</small></strong></div>{method === 'credit' && <p className={styles.installmentSummary}>{installments}x de <strong>{installmentAmount}</strong> sem juros</p>}<p className={styles.cancelNote}>{selectedPlan === 'VITALICIO' ? 'Após a aprovação, você recebe mais 60 dias de acesso para comemorar e revisar seus estudos.' : 'Seu acesso fica disponível por 90 dias a partir da confirmação.'}</p></aside>
    </section>
    <section className={styles.currentPlan}><div className={styles.planIcon}><AwardIcon size={24} /></div><div className={styles.planCopy}><p className={styles.kicker}>Plano atual</p><h2>{plans.basic.name}</h2><p>{plans.basic.description}</p></div><span className={styles.activeBadge}>Ativo</span></section>
  </div>;
}