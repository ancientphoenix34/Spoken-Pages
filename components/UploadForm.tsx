'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Upload, X, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import LoadingOverlay from '@/components/LoadingOverlay'
import { DEFAULT_VOICE, voiceCategories, voiceOptions } from '@/lib/constants'
import { uploadFormSchema, type UploadFormValues } from '@/lib/validations'

type FormValues = UploadFormValues

interface FileDropzoneProps {
  id: string
  caption: string
  label: string
  hint: string
  accept: string
  icon: LucideIcon
  file?: File
  onChange: (file: File | undefined) => void
  error?: string
}

function FileDropzone({ id, caption, label, hint, accept, icon: Icon, file, onChange, error }: FileDropzoneProps) {
  return (
    <div>
      <label htmlFor={id} className="form-label">
        {caption}
      </label>
      <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            'upload-dropzone file-upload-shadow border-2 border-dashed',
            file ? 'upload-dropzone-uploaded border-transparent' : 'border-[var(--border-medium)]'
          )}
        >
          <input
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0])}
          />
          <Icon className="upload-dropzone-icon" />
          <p className="upload-dropzone-text truncate max-w-full px-6">{file ? file.name : label}</p>
          <p className="upload-dropzone-hint">{file ? 'Click to replace' : hint}</p>
        </label>
        {file && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove file"
            className="upload-dropzone-remove absolute top-3 right-3 z-30"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm font-normal text-destructive">{error}</p>}
    </div>
  )
}

function VoiceSelector({ control, error }: { control: Control<FormValues>; error?: { message?: string } }) {
  return (
    <FieldSet>
      <FieldLegend className="form-label">Choose Assistant Voice</FieldLegend>
      <Controller
        name="voice"
        control={control}
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-4">
            {(['male', 'female'] as const).map((category) => (
              <div key={category}>
                <p className="mb-2 text-sm font-medium capitalize text-[var(--text-secondary)]">
                  {category} Voices
                </p>
                <div className="voice-selector-options">
                  {voiceCategories[category].map((key) => {
                    const voice = voiceOptions[key as keyof typeof voiceOptions]
                    const selected = field.value === key

                    return (
                      <label
                        key={key}
                        htmlFor={`voice-${key}`}
                        className={cn(
                          'voice-selector-option',
                          selected ? 'voice-selector-option-selected' : 'voice-selector-option-default'
                        )}
                      >
                        <RadioGroupItem id={`voice-${key}`} value={key} />
                        <FieldContent>
                          <span className="font-semibold text-[var(--text-primary)]">{voice.name}</span>
                          <span className="text-sm text-[var(--text-secondary)]">{voice.description}</span>
                        </FieldContent>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      <FieldError errors={[error]} />
    </FieldSet>
  )
}

const UploadForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      author: '',
      voice: DEFAULT_VOICE,
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('pdfFile', values.pdfFile)
      if (values.coverImage) formData.append('coverImage', values.coverImage)
      formData.append('title', values.title)
      formData.append('author', values.author)
      formData.append('voice', values.voice)

      await new Promise((resolve) => setTimeout(resolve, 2500))

      router.push('/')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="new-book-wrapper space-y-8">
        <Controller
          name="pdfFile"
          control={control}
          render={({ field, fieldState }) => (
            <FileDropzone
              id="pdfFile"
              caption="Book PDF File"
              label="Click to upload PDF"
              hint="PDF file (max 50MB)"
              accept="application/pdf"
              icon={Upload}
              file={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="coverImage"
          control={control}
          render={({ field, fieldState }) => (
            <FileDropzone
              id="coverImage"
              caption="Cover Image (Optional)"
              label="Click to upload cover image"
              hint="Leave empty to auto-generate from PDF"
              accept="image/jpeg,image/png,image/webp"
              icon={ImageIcon}
              file={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Field>
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <Input id="title" placeholder="ex: Rich Dad Poor Dad" className="form-input" {...register('title')} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <label htmlFor="author" className="form-label">
            Author Name
          </label>
          <Input id="author" placeholder="ex: Robert Kiyosaki" className="form-input" {...register('author')} />
          <FieldError errors={[errors.author]} />
        </Field>

        <VoiceSelector control={control} error={errors.voice} />

        <button type="submit" className="form-btn" disabled={isSubmitting}>
          Begin Synthesis
        </button>
      </form>

      {isSubmitting && <LoadingOverlay />}
    </>
  )
}

export default UploadForm
