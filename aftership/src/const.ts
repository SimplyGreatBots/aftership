import { z } from '@botpress/sdk'

export const trackingResponseSchema = z.object({
  meta: z.object({
    code: z.number(),
    message: z.string().optional(),
    type: z.string().optional(),
  }),
  data: z.object({
    id: z.string().optional(),
    tracking_number: z.string().optional(),
    slug: z.string().optional(),
  }).optional(),
})
