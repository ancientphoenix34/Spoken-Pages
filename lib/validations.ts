import { z } from 'zod'

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  voiceOptions,
} from '@/lib/constants'

const voiceKeys = Object.keys(voiceOptions) as [string, ...string[]]

export const uploadFormSchema = z.object({
  pdfFile: z
    .instanceof(File, { message: 'Please upload a PDF file' })
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), 'Only PDF files are supported')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'PDF must be smaller than 50MB'),
  coverImage: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only JPG, PNG, or WEBP images are supported')
    .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Cover image must be smaller than 10MB')
    .optional(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author name is required'),
  voice: z.enum(voiceKeys, 'Please choose a voice'),
})

export type UploadFormValues = z.infer<typeof uploadFormSchema>
