/**
 * Ilustração de assinatura do produto: o "mapa de aprendizado" — módulos
 * concluídos, o módulo atual e módulos bloqueados, conectados por um
 * caminho. Esse é o próprio conceito central da experiência (ver a página
 * de progresso), por isso ele abre o site no hero em vez de um gráfico
 * genérico.
 */
export function LearningPathIllustration() {
  const nodes = [
    { x: 74, y: 44, status: 'done' as const, label: 'Introdução ao Direito' },
    { x: 210, y: 118, status: 'done' as const, label: 'Direito Constitucional' },
    { x: 118, y: 224, status: 'current' as const, label: 'Direito Civil' },
    { x: 246, y: 322, status: 'locked' as const, label: 'Direito Penal' },
    { x: 118, y: 420, status: 'locked' as const, label: 'Direito Processual' },
  ];

  return (
    <svg
      viewBox="0 0 340 470"
      width="100%"
      height="100%"
      role="img"
      aria-label="Mapa de aprendizado mostrando módulos concluídos, o módulo atual em Direito Civil e módulos ainda bloqueados"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M74,44 Q160,64 210,118 Q170,178 118,224 Q220,258 246,322 Q190,378 118,420"
        fill="none"
        stroke="rgba(247,248,250,0.22)"
        strokeWidth="3"
        strokeDasharray="1 12"
        strokeLinecap="round"
      />

      {nodes.map((node) => (
        <Node key={node.label} {...node} />
      ))}
    </svg>
  );
}

interface NodeProps {
  x: number;
  y: number;
  status: 'done' | 'current' | 'locked';
  label: string;
}

function Node({ x, y, status, label }: NodeProps) {
  const isRight = x > 170;
  const textAnchor = isRight ? 'start' : 'end';
  const textX = isRight ? x + 30 : x - 30;

  return (
    <g>
      {status === 'current' && (
        <circle cx={x} cy={y} r={30} fill="none" stroke="var(--color-tertiary)" strokeWidth="1.5" opacity="0.5" />
      )}

      <circle
        cx={x}
        cy={y}
        r={status === 'current' ? 22 : 17}
        fill={
          status === 'done'
            ? 'var(--color-accent)'
            : status === 'current'
              ? 'var(--color-secondary)'
              : 'rgba(247,248,250,0.12)'
        }
        stroke={status === 'locked' ? 'rgba(247,248,250,0.28)' : 'none'}
        strokeWidth="1.5"
      />

      {status === 'done' && (
        <path
          d={`M${x - 7},${y} l5,5 l9,-10`}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {status === 'current' && <circle cx={x} cy={y} r={6} fill="var(--color-text-on-primary)" />}

      {status === 'locked' && (
        <g transform={`translate(${x - 5}, ${y - 6})`} opacity="0.75">
          <rect x="0" y="4.5" width="10" height="7.5" rx="1.5" fill="var(--color-text-on-primary-muted)" />
          <path
            d="M2 4.5V3a3 3 0 0 1 6 0v1.5"
            fill="none"
            stroke="var(--color-text-on-primary-muted)"
            strokeWidth="1.4"
          />
        </g>
      )}

      <text
        x={textX}
        y={y + 5}
        textAnchor={textAnchor}
        fontFamily="Inter, sans-serif"
        fontSize="13"
        fontWeight={status === 'current' ? 600 : 500}
        fill={status === 'locked' ? 'var(--color-text-on-primary-muted)' : 'var(--color-text-on-primary)'}
      >
        {label}
      </text>
    </g>
  );
}
