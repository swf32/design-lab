import './WireframeScreenPreview.scss'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

export type WireframeScreenPreviewProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  viewportWidth?: number
  viewportHeight?: number
}

export function WireframeScreenPreview({
  children,
  viewportWidth = 1440,
  viewportHeight = 810,
  className,
  style,
  ...props
}: WireframeScreenPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => setWidth(root.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const scale = width > 0 ? width / viewportWidth : 0

  return (
    <div
      ref={rootRef}
      className={`dl-wireframe-screen-preview${className ? ` ${className}` : ''}`}
      style={
        {
          '--dl-wireframe-preview-ratio': `${viewportWidth} / ${viewportHeight}`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div
        className="dl-wireframe-screen-preview__viewport"
        aria-hidden="true"
        inert
        style={{
          width: viewportWidth,
          height: viewportHeight,
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
