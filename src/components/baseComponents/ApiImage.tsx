import { ImageOff } from 'lucide-react'
import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react'

type ApiImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  fallback?: ReactNode
}

const ApiImage = ({ src, alt = '', className = '', fallback, onError, ...props }: ApiImageProps) => {
  const [imageState, setImageState] = useState({
    source: '',
    dataUrl: '',
    hasError: false,
  })
  const isDirectSource = Boolean(
    src?.startsWith('blob:') || src?.startsWith('data:') || src?.startsWith('/'),
  )

  useEffect(() => {
    if (!src || isDirectSource) return
    const controller = new AbortController()

    const loadImage = async () => {
      try {
        const response = await fetch(src, {
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
        })
        if (!response.ok) throw new Error(`Image request failed: ${response.status}`)
        const imageBlob = await response.blob()
        if (!imageBlob.type.startsWith('image/')) {
          throw new Error('Response is not an image')
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(imageBlob)
        })
        if (controller.signal.aborted) return
        setImageState({ source: src, dataUrl, hasError: false })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setImageState({ source: src, dataUrl: '', hasError: true })
        }
      }
    }

    void loadImage()
    return () => controller.abort()
  }, [isDirectSource, src])

  const isCurrentSource = imageState.source === src
  const hasError = isCurrentSource && imageState.hasError
  const resolvedSource = isDirectSource
    ? src
    : isCurrentSource
      ? imageState.dataUrl
      : ''

  if (!resolvedSource || hasError) {
    return fallback ?? (
      <span className={`inline-flex items-center justify-center bg-primary-soft text-primary ${className}`} role="img" aria-label={alt || 'Image unavailable'}>
        <ImageOff size={20} />
      </span>
    )
  }

  return (
    <img
      src={resolvedSource}
      alt={alt}
      className={className}
      onError={(event) => {
        setImageState({ source: src ?? '', dataUrl: '', hasError: true })
        onError?.(event)
      }}
      {...props}
    />
  )
}

export default ApiImage
