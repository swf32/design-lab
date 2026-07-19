import type { ButtonHTMLAttributes, ReactNode } from 'react'
export function IconButton({ className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) { return <button className={`dl-icon-button${className ? ` ${className}` : ''}`} {...props}>{children}</button> }
