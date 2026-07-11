'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Upload, X, type LucideIcon } from 'lucide-react'

import { cn, parsePDFFile } from '@/lib/utils'
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
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner';
import { checkBookExists, createBook, saveBookSegemnts } from '@/lib/actions/book.actions'
import { upload } from '@vercel/blob/client'

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
        name="persona"
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
  const { userId } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      author: '',
      persona: DEFAULT_VOICE,
      pdfFile: undefined,
      coverImage: undefined,
    },
  })

  const onSubmit = async (data: FormValues) => {

    if (!userId) {
      return toast.error("Please login to upload books")
    }
    setIsSubmitting(true)

    //PostHog->Track book uploads

    try {
      const existsCheck = await checkBookExists(data.title);
      if (existsCheck.exists && existsCheck.book) {
        toast.info("Book with same title already exists.");
        reset();
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
      const pdfFile = data.pdfFile;

      const parsedPDF = await parsePDFFile(pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF,Please try again with different file.");
        return;
      }

      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf'
      });

      let coverUrl: string;

      if (data.coverImage) {
        const coverFile = data.coverImage;
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: coverFile.type
        });

        coverUrl = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPDF.cover)
        const blob = await response.blob();

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: 'image/png'
        });

        coverUrl = uploadedCoverBlob.url
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size
      });

      if (!book.success) throw new Error("Failed to craete a book");

      if (book.alreadyExists) {
        toast.info("Book with same title already exists.");
        reset();
        router.push(`/books/${book.data.slug}`);
        return;
      }

      const segments = await saveBookSegemnts(book.data._id, userId, parsedPDF.content);

      if (!segments.success) {
        toast.error("Failed to save segements")
        throw new Error("Failed to save book segments");
      }

      reset();
      router.push(`/books/${book.data.slug}`);
    } catch (e) {
      console.error(e);

      toast.error("Failed to upload book,Please try again later.");
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

        <VoiceSelector control={control} error={errors.persona} />

        <button type="submit" className="form-btn" disabled={isSubmitting}>
          Begin Synthesis
        </button>
      </form>

      {isSubmitting && <LoadingOverlay />}
    </>
  )
}

export default UploadForm
