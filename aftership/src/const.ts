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

export const aftershipWebhookEventSchema = z.object({
  event: z.string(),
  event_id: z.string().uuid(),
  is_tracking_first_tag: z.boolean(),
  msg: z.object({
    custom_fields: z.object({
      conversation_id: z.string().optional()
    }).optional(),
  }).passthrough(),
  ts: z.number()
}).passthrough()