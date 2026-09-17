import { Link } from 'react-router-dom';
import { PublicFooter } from '../../layouts/public/PublicFooter';
import { PublicHeader } from '../../layouts/public/PublicHeader';
import styles from './LegalPage.module.css';

type LegalDocument = 'terms' | 'privacy';

const documents = {
  terms: {
    eyebrow: 'Documento legal',
    title: 'Termos de Uso',
    updatedAt: '11 de setembro de 2026',
  },
  privacy: {
    eyebrow: 'Proteção de dados',
    title: 'Política de Privacidade',
    updatedAt: '11 de setembro de 2026',
  },
} as const;

export function LegalPage({ document }: { document: LegalDocument }) {
  const content = documents[document];

  return (
    <>
      <PublicHeader />
      <main className={styles.page}>
        <article className={styles.document}>
          <Link to="/" className={styles.backLink}>
            ← Voltar para a página inicial
          </Link>
          <header className={styles.header}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className={styles.updatedAt}>Última atualização: {content.updatedAt}</p>
          </header>
          {document === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </article>
      </main>
      <PublicFooter />
    </>
  );
}

function TermsContent() {
  return (
    <div className={styles.content}>
      <p>
        Estes Termos de Uso regulam o acesso e a utilização da OAB Mentoria, uma plataforma de apoio à preparação para o Exame de Ordem. Ao criar uma conta ou utilizar a plataforma, você declara que leu e concorda com estes termos.
      </p>
      <Section title="1. Sobre a plataforma">
        <p>A OAB Mentoria oferece aulas, materiais, questões, simulados, acompanhamento de progresso e recursos de gamificação para fins educacionais.</p>
        <p>O conteúdo é material de apoio e não substitui a legislação vigente, a doutrina, a orientação de profissionais habilitados ou os editais oficiais da OAB.</p>
      </Section>
      <Section title="2. Cadastro e conta">
        <p>Você deve fornecer informações verdadeiras, manter seus dados atualizados e proteger suas credenciais de acesso. A conta é pessoal e não pode ser compartilhada ou transferida.</p>
        <p>Em caso de uso indevido, fraude ou violação destes termos, a conta poderá ser suspensa ou encerrada, respeitados os direitos aplicáveis.</p>
      </Section>
      <Section title="3. Planos e pagamentos">
        <p>Quando disponíveis, os planos pagos, preços, prazo de acesso e condições de contratação serão apresentados antes da confirmação do pagamento. Os pagamentos são processados por provedores especializados, como o Stripe.</p>
        <p>Cancelamentos, arrependimento e reembolsos observarão a legislação aplicável e as condições informadas no momento da contratação.</p>
      </Section>
      <Section title="4. Conteúdo e propriedade intelectual">
        <p>Textos, aulas, marcas, software, layouts e demais elementos da plataforma pertencem à OAB Mentoria ou a seus licenciadores. É proibido copiar, distribuir, revender, extrair ou disponibilizar esse conteúdo sem autorização.</p>
      </Section>
      <Section title="5. Disponibilidade e responsabilidade">
        <p>Buscamos manter a plataforma disponível e segura, mas podem ocorrer interrupções para manutenção, atualizações ou fatores fora do nosso controle. Não garantimos aprovação no Exame de Ordem, pois o resultado depende também da preparação e do desempenho individual.</p>
      </Section>
      <Section title="6. Alterações e contato">
        <p>Estes termos podem ser atualizados para refletir mudanças na plataforma ou na legislação. A versão vigente estará sempre disponível nesta página.</p>
        <p>Para dúvidas sobre estes termos, utilize o canal de atendimento informado na plataforma.</p>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className={styles.content}>
      <p>
        Esta Política explica como a OAB Mentoria coleta, utiliza, armazena e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
      </p>
      <Section title="1. Quem é o controlador">
        <p>O controlador dos dados é a pessoa jurídica responsável pela operação da OAB Mentoria. Os dados cadastrais e o canal oficial de contato do controlador devem ser preenchidos e mantidos atualizados pelo responsável pelo serviço antes da publicação definitiva.</p>
      </Section>
      <Section title="2. Dados coletados">
        <p>Podemos coletar nome, email, credenciais protegidas, dados de perfil, progresso de estudos, respostas, resultados de simulados e registros de uso da plataforma.</p>
        <p>Dados de pagamento são processados pelo provedor de pagamentos. A OAB Mentoria não armazena o número completo do cartão.</p>
      </Section>
      <Section title="3. Finalidades e bases legais">
        <p>Usamos os dados para criar e administrar sua conta, fornecer os recursos contratados, registrar progresso, personalizar a experiência, processar pagamentos, prevenir fraudes, enviar comunicações relacionadas ao serviço e cumprir obrigações legais.</p>
        <p>As bases legais podem incluir execução de contrato, cumprimento de obrigação legal, exercício regular de direitos, legítimo interesse e consentimento, conforme a finalidade.</p>
      </Section>
      <Section title="4. Compartilhamento e armazenamento">
        <p>Podemos compartilhar dados com fornecedores que hospedam a aplicação, banco de dados, email, pagamentos, armazenamento e monitoramento, sempre na medida necessária para a operação e com deveres de segurança e confidencialidade.</p>
        <p>Os dados são mantidos pelo período necessário às finalidades informadas ou pelo prazo exigido por lei. Após esse período, serão eliminados ou anonimizados quando possível.</p>
      </Section>
      <Section title="5. Seus direitos">
        <p>Você pode solicitar confirmação do tratamento, acesso, correção, anonimização, eliminação quando aplicável, portabilidade, informações sobre compartilhamento e revisão de decisões automatizadas, além de revogar consentimentos quando essa for a base legal.</p>
        <p>As solicitações devem ser encaminhadas ao canal de privacidade informado pelo controlador. Poderemos solicitar confirmação de identidade para proteger sua conta.</p>
      </Section>
      <Section title="6. Segurança e cookies">
        <p>Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda e uso indevido. Nenhuma transmissão ou armazenamento é completamente livre de riscos.</p>
        <p>A plataforma utiliza cookies necessários à autenticação e ao funcionamento do serviço. Cookies adicionais somente devem ser ativados conforme as preferências e consentimentos aplicáveis.</p>
      </Section>
      <Section title="7. Encarregado e atualizações">
        <p>O contato do encarregado pelo tratamento de dados deve ser informado pelo controlador nesta política antes da publicação definitiva. Esta página poderá ser atualizada para refletir mudanças legais ou operacionais.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
