import { useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedPlanData = selectedPlan === 'BASICO' ? plans.basic : plans.lifetime;
  const totalInCents = Number(selectedPlanData.price.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.')) * 100;
  const installmentAmount = (totalInCents / installments / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const { checkoutUrl } = await subscriptionApi.createCheckout(selectedPlan);
      window.location.assign(checkoutUrl);
    } catch {
      setIsProcessing(false);
      showToast('Não foi possível iniciar o checkout. Tente novamente.', 'error');
    }
  };

  return <div className={styles.page}>
    <div className={styles.header}><p className={styles.eyebrow}>Minha conta</p><h1>Minha assinatura</h1><p className={styles.subtitle}>Escolha entre 90 dias de preparação ou acesso até sua aprovação.</p></div>
    <section className={styles.checkoutGrid}>
      <div className={styles.paymentPanel}>
        <div className={styles.panelHeading}><div><p className={styles.kicker}>Checkout seguro</p><h2>Como você quer pagar?</h2></div><LockIcon size={19} /></div>
        <div className={styles.methodTabs} role="tablist" aria-label="Plano de assinatura">
          {([['BASICO', 'Básico · 90 dias'], ['VITALICIO', 'Vitalício · até passar']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={selectedPlan === value} className={selectedPlan === value ? styles.methodActive : ''} onClick={() => setSelectedPlan(value)}>{label}</button>)}
        </div>
        <div className={styles.methodTabs} role="tablist" aria-label="Método de pagamento">
          {([['credit', 'Cartão de crédito'], ['debit', 'Cartão de débito'], ['pix', 'PIX']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={method === value} className={method === value ? styles.methodActive : ''} onClick={() => { setMethod(value); if (value !== 'credit') setInstallments(1); }}>{label}</button>)}
        </div>
        <div className={styles.pixInfo}><div className={styles.pixMark}>✓</div><div><h3>Checkout protegido</h3><p>Você será redirecionado para o Stripe para concluir o pagamento com segurança. O acesso só é liberado após a confirmação do pagamento.</p></div></div>
        <button className={styles.submitButton} type="button" onClick={handleSubmit} disabled={isProcessing}>{isProcessing ? 'Abrindo checkout...' : `Continuar para pagar ${selectedPlanData.price}`}</button>
        <p className={styles.secureNote}><LockIcon size={14} /> Seus dados são protegidos e não ficam armazenados.</p>
      </div>
      <aside className={styles.orderSummary}><p className={styles.kicker}>Resumo do pedido</p><h2>{selectedPlanData.name}</h2><p className={styles.summaryDescription}>{selectedPlanData.description}</p><ul>{selectedPlanData.features.slice(0, 5).map((feature) => <li key={feature}><CheckCircleIcon size={16} />{feature}</li>)}</ul><div className={styles.total}><span>Total hoje</span><strong>{selectedPlanData.price}<small>{selectedPlanData.period}</small></strong></div>{method === 'credit' && <p className={styles.installmentSummary}>{installments}x de <strong>{installmentAmount}</strong> sem juros</p>}<p className={styles.cancelNote}>{selectedPlan === 'VITALICIO' ? 'Após a aprovação, você recebe mais 60 dias de acesso para comemorar e revisar seus estudos.' : 'Seu acesso fica disponível por 90 dias a partir da confirmação.'}</p></aside>
    </section>
    <section className={styles.currentPlan}><div className={styles.planIcon}><AwardIcon size={24} /></div><div className={styles.planCopy}><p className={styles.kicker}>Plano atual</p><h2>{plans.basic.name}</h2><p>{plans.basic.description}</p></div><span className={styles.activeBadge}>Ativo</span></section>
  </div>;
}