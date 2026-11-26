import {
  ArrowLeft,
  Clock3,
  ImageUp,
  LoaderCircle,
  Type,
} from 'lucide-react'
import axios from 'axios'
import JoditEditor from 'jodit-react'
import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type SubmitEventHandler,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import ApiImage from '../../components/baseComponents/ApiImage'
import { apiUrls } from '../../config/api'
import {
  setLastCreatedBlog,
  setUpdatedBlog,
} from '../../store/blogSlice'
import { useAppDispatch } from '../../store/hooks'
import type {
  CreateBlogResponse,
  SafetyTipFormProps,
  SafetyTipNavigationState,
  UpdateBlogResponse,
} from '../../types'

const editorButtons = [
  'source',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'ul',
  'ol',
  '|',
  'font',
  'fontsize',
  'brush',
  'paragraph',
  '|',
  'image',
  'table',
  'link',
  '|',
  'align',
  '|',
  'undo',
  'redo',
  'eraser',
  'copyformat',
  'fullsize',
  'dots',
]

const CreateSafetyTip = ({ mode }: SafetyTipFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const existingTip = (location.state as SafetyTipNavigationState | null)?.tip
  const isEditing = mode === 'edit' && Boolean(existingTip)
  const isViewMode = mode === 'view' && Boolean(existingTip)
  const pageTitle = isViewMode
    ? 'View Safety Tip'
    : isEditing
      ? 'Edit Safety Tip'
      : 'Create Safety Tip'
  const editorRef = useRef(null)
  const [title, setTitle] = useState(existingTip?.title ?? '')
  const [excerpt, setExcerpt] = useState(
    existingTip?.description.replace(/<[^>]*>/g, '').trim() ?? '',
  )
  const [category, setCategory] = useState('Road Safety')
  const [description, setDescription] = useState(existingTip?.description ?? '')
  const descriptionValueRef = useRef(existingTip?.description ?? '')
  const [readTime, setReadTime] = useState(
    existingTip ? String(existingTip.readTime) : '',
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(existingTip?.image ?? '')
  const [coverImage, setCoverImage] = useState(existingTip?.image ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorConfig = useMemo(
    () => ({
      readonly: isViewMode,
      height: 260,
      placeholder: 'Write safety tip details here...',
      toolbarAdaptive: false,
      toolbarSticky: false,
      spellcheck: true,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      enter: 'p' as const,
      buttons: editorButtons,
      buttonsMD: editorButtons,
      buttonsSM: editorButtons,
      buttonsXS: editorButtons,
    }),
    [isViewMode],
  )

  const selectImage = (file: File | undefined) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Featured image must be 5 MB or smaller.')
      return
    }
    setError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const imageValue = String(reader.result ?? '')
      setImagePreview(imageValue)
      setCoverImage(imageValue)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (isViewMode) return
    selectImage(event.dataTransfer.files[0])
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (isViewMode) return
    setError('')
    const latestDescription = descriptionValueRef.current
    const plainDescription = latestDescription
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()

    if (
      !title.trim() ||
      !excerpt.trim() ||
      !plainDescription ||
      (!imageFile && !coverImage.trim()) ||
      !category.trim() ||
      !readTime
    ) {
      setError('Please complete all required fields.')
      return
    }
    if (Number(readTime) < 1) {
      setError('Read time must be at least 1 minute.')
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('excerpt', excerpt.trim())
    formData.append('content', latestDescription)
    formData.append('category', category.trim())
    formData.append('readTimeLabel', `${Number(readTime)} min read`)
    formData.append('status', 'published')
    if (imageFile) formData.append('coverImage', imageFile)
    else if (!isEditing || coverImage.trim() !== existingTip?.image) {
      formData.append('coverImage', coverImage.trim())
    }
    const requestFailureMessage = isEditing
      ? 'Unable to update safety tip.'
      : 'Unable to create safety tip.'

    try {
      setIsSubmitting(true)
      const response = isEditing
        ? await axios.put(apiUrls.blogById(existingTip!.id), formData)
        : await axios.post(apiUrls.blogs, formData)
      const result = response.data as CreateBlogResponse | UpdateBlogResponse

      if (!result.success) {
        setError(result.message || requestFailureMessage)
        return
      }

      if (isEditing) dispatch(setUpdatedBlog(result.data))
      else dispatch(setLastCreatedBlog(result.data))
      navigate('/safety-tips')
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            requestError.message ??
            requestFailureMessage,
        )
      } else {
        setError(requestFailureMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button
          type="button"
          onClick={() => navigate('/safety-tips')}
          className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Road &amp; Safety Tips <span>/</span>{' '}
          <strong className="text-text">
            {pageTitle}
          </strong>
        </button>

        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">
            {pageTitle}
          </h1>
          <p className="mt-1 mb-0 text-small text-text-muted">
            {isViewMode
              ? 'Review the complete road or safety awareness tip.'
              : isEditing
              ? 'Update the road or safety awareness tip.'
              : 'Add a new road or safety awareness tip for users.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-2"
        >
          <label className="order-1 block">
            <span className="mb-2 block text-small font-semibold text-text">
              Title <span className="text-primary">*</span>
            </span>
            <span className="relative block">
              <Type size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                readOnly={isViewMode}
                placeholder="Enter safety tip title"
                className="h-11 w-full rounded-lg border border-border bg-white pr-3 pl-10 text-small text-text outline-none transition-colors focus:border-primary"
              />
            </span>
          </label>

          <label className="order-3 block lg:col-span-2">
            <span className="mb-2 block text-small font-semibold text-text">
              Excerpt <span className="text-primary">*</span>
            </span>
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              readOnly={isViewMode}
              rows={3}
              placeholder="Enter a short summary for the safety tip"
              className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-small text-text outline-none transition-colors focus:border-primary"
            />
          </label>

          <label className="order-4 block lg:col-span-2">
            <span className="mb-2 block text-small font-semibold text-text">
              Category <span className="text-primary">*</span>
            </span>
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              readOnly={isViewMode}
              placeholder="e.g., Road Safety"
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary"
            />
          </label>

          <div className="order-7">
            <p className="mb-2 text-small font-semibold text-text">
              Content <span className="text-primary">*</span>
            </p>
            <div className="overflow-hidden rounded-lg border border-border bg-white focus-within:border-primary">
              <JoditEditor
                ref={editorRef}
                value={description}
                config={editorConfig}
                tabIndex={1}
                onBlur={(newContent) => {
                  descriptionValueRef.current = newContent
                  setDescription(newContent)
                }}
                onChange={(newContent) => {
                  descriptionValueRef.current = newContent
                }}
              />
            </div>
          </div>

          <div className="order-8">
            <p className="mb-2 text-small font-semibold text-text">
              Cover Image <span className="text-primary">*</span>
            </p>
            <input
              type="url"
              value={coverImage}
              onChange={(event) => {
                setCoverImage(event.target.value)
                setImagePreview(event.target.value)
              }}
              readOnly={isViewMode}
              placeholder="Enter cover image URL"
              className="mb-2 h-11 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary"
            />
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-primary-border bg-white px-4 py-6 text-center transition-colors lg:min-h-[260px] ${
                isViewMode
                  ? 'cursor-default'
                  : 'cursor-pointer hover:bg-primary-hover'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isViewMode}
                onChange={(event) => selectImage(event.target.files?.[0])}
                className="hidden"
              />
              {imagePreview ? (
                <ApiImage
                  src={imagePreview}
                  alt={title || 'Featured safety tip'}
                  className="h-36 w-full max-w-md rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <ImageUp size={22} />
                </span>
              )}
              <p className="mt-3 mb-0 text-small font-semibold text-text">
                {imageFile
                  ? imageFile.name
                  : existingTip && !isViewMode
                    ? 'Current featured image · click to replace'
                    : existingTip
                      ? 'Current featured image'
                    : 'Drag & drop an image here, or click to browse'}
              </p>
              <p className="mt-1 mb-0 text-tiny text-text-muted">
                JPG, PNG or WEBP (Max 5 MB) · Recommended: 1200 × 630 px
              </p>
            </label>
          </div>

          <label className="order-2 block">
            <span className="mb-2 block text-small font-semibold text-text">
              Read Time (in minutes) <span className="text-primary">*</span>
            </span>
            <span className="relative block">
              <Clock3 size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
              <input
                type="number"
                min="1"
                value={readTime}
                onChange={(event) => setReadTime(event.target.value)}
                readOnly={isViewMode}
                placeholder="e.g., 5"
                className="h-11 w-full rounded-lg border border-border bg-white pr-3 pl-10 text-small text-text outline-none transition-colors focus:border-primary"
              />
            </span>
          </label>

          {error && (
            <p className="order-10 m-0 rounded-lg bg-accent-soft px-3 py-2 text-small font-medium text-accent lg:col-span-2">
              {error}
            </p>
          )}

          <div className="order-11 flex flex-wrap justify-end gap-2 border-t border-border pt-5 lg:col-span-2">
            {isViewMode ? (
              <>
                <Button variant="outline" size="small" onClick={() => navigate('/safety-tips')}>Back</Button>
                <Button variant="red" size="small" onClick={() => navigate(`/safety-tips/edit/${existingTip?.slug ?? existingTip?.id}`, { state: { tip: existingTip } })}>
                  Edit Safety Tip
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="small" onClick={() => navigate('/safety-tips')}>Cancel</Button>
                <Button type="submit" variant="red" size="small" disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <LoaderCircle size={15} className="animate-spin" />}
                  {isSubmitting
                    ? isEditing
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditing
                      ? 'Update Safety Tip'
                      : 'Create Safety Tip'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSafetyTip
