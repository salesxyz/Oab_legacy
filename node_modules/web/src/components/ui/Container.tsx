import type { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div className={['container', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
