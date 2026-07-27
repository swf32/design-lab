import './SlotPlaceholder.scss'
import type { CSSProperties, HTMLAttributes } from 'react'
import { PlusIcon } from '../../../../assets/icons/PlusIcon'

export type SlotPlaceholderProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
}

export function SlotPlaceholder({
  width = '100%',
  height = '100%',
  className,
  style,
  ...props
}: SlotPlaceholderProps) {
  return (
    <span
      className={`dl-slot-placeholder${className ? ` ${className}` : ''}`}
      style={{ ...style, width, height }}
      {...props}
      aria-hidden="true"
    >
      <PlusIcon className="dl-slot-placeholder__icon" size={12} />
    </span>
  )
}
