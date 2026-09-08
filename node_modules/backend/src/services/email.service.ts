import { env } from '../config/env';
import { logger } from '../config/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailProvider {
  send(params: SendEmailParams): Promise<void>;
}

/**
 * Provider padrão para desenvolvimento: apenas registra o e-mail no log
 * estruturado em vez de enviar de verdade. Nunca loga o código/segredo em si
 * fora deste contexto de desenvolvimento explícito.
 */
class ConsoleEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<void> {
    logger.info('📧 [DEV] Email não enviado de verdade (EMAIL_PROVIDER=console)', {
      to: params.to,
      subject: params.subject,
    });
    // eslint-disable-next-line no-console
    console.log('\n--- EMAIL (modo desenvolvimento) ---');
    console.log(`Para: ${params.to}`);
    console.log(`Assunto: ${params.subject}`);
    console.log(params.text);
    console.log('-------------------------------------\n');
  }
}

/**
 * Provider de produção via Resend (https://resend.com). Basta configurar
 * EMAIL_PROVIDER=resend e EMAIL_API_KEY no .env — nenhuma mudança de código
 * é necessária. Outros provedores (SendGrid, SMTP) seguem o mesmo contrato.
 */
class ResendEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Falha ao enviar email via Resend: ${response.status} ${body}`);
    }
  }
}

class SendgridEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: env.EMAIL_FROM },
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.text },
          { type: 'text/html', value: params.html },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Falha ao enviar email via SendGrid: ${response.status} ${body}`);
    }
  }
}

function getProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case 'resend':
      return new ResendEmailProvider();
    case 'sendgrid':
      return new SendgridEmailProvider();
    case 'smtp':
      // Implementação SMTP (ex.: via nodemailer) pode ser plugada aqui seguindo
      // o mesmo contrato EmailProvider, sem alterar o restante da aplicação.
      logger.warn('EMAIL_PROVIDER=smtp ainda não implementado; usando fallback console.');
      return new ConsoleEmailProvider();
    case 'console':
    default:
      return new ConsoleEmailProvider();
  }
}

function baseTemplate(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a2332;">
    <h2 style="color: #0d1b3e;">${title}</h2>
    ${bodyHtml}
    <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
    <p style="font-size: 12px; color: #64748b;">OAB Mentoria — este é um email automático, não responda.</p>
  </div>`;
}

export const emailService = {
  async sendPasswordResetCode(to: string, name: string, code: string) {
    const html = baseTemplate(
      'Recuperação de senha',
      `<p>Olá, ${name}.</p>
       <p>Use o código abaixo para redefinir sua senha. Ele expira em alguns minutos e só pode ser usado uma vez.</p>
       <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
       <p>Se você não solicitou essa alteração, ignore este email.</p>`,
    );
    const text = `Olá, ${name}. Seu código de recuperação de senha é: ${code}. Ele expira em poucos minutos e só pode ser usado uma vez.`;
    await getProvider().send({ to, subject: 'Código de recuperação de senha', html, text });
  },

  async sendWelcomeEmail(to: string, name: string) {
    const html = baseTemplate(
      'Bem-vindo(a) à OAB Mentoria!',
      `<p>Olá, ${name}.</p><p>Sua conta foi criada com sucesso. Bons estudos na preparação para a prova da OAB!</p>`,
    );
    const text = `Olá, ${name}. Sua conta na OAB Mentoria foi criada com sucesso.`;
    await getProvider().send({ to, subject: 'Bem-vindo(a) à OAB Mentoria', html, text });
  },

  async sendApprovalEmail(to: string, name: string, accessExpiresAt: Date | null) {
    const expiration = accessExpiresAt ? accessExpiresAt.toLocaleDateString('pt-BR') : 'o fim do seu acesso';
    const html = baseTemplate(
      'Parabéns pela aprovação na OAB!',
      `<p>Olá, ${name}.</p><p>Recebemos a confirmação de que você foi aprovado(a) na prova da OAB. Estamos muito felizes por essa conquista!</p><p>Como presente, seu acesso à OAB Mentoria foi estendido por mais 60 dias, até <strong>${expiration}</strong>.</p>`,
    );
    const text = `Olá, ${name}. Parabéns pela aprovação na prova da OAB! Seu acesso à OAB Mentoria foi estendido por mais 60 dias, até ${expiration}.`;
    await getProvider().send({ to, subject: 'Parabéns pela sua aprovação na OAB!', html, text });
  },
};
