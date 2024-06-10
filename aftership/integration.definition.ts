import { IntegrationDefinition, z } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '0.0.1',
  readme: 'hub.md',
  icon: 'icon.svg',
  title: 'Aftership',
  description: 'Aftership integration for Botpress',
  configuration: {
    schema: z.object({
      apiKey: z.string().describe('Aftership API Key'),
      secret: z.string().describe('Aftership Secret'),
    }),
  },
  channels: {},
  actions:{
    createTracking: {
      title: 'Create AfterShip Tracking',
      description: 'Create a new tracking in AfterShip',
      input: {
        schema: z.object({
          trackingNumber: z.string().describe('Tracking number of the shipment'),
          slug: z.string().describe('Unique courier code'),
          title: z.string().describe('Custom title for the tracking (defaults to tracking number)').optional(),
          orderId: z.string().describe('Globally-unique identifier for the order'),
        }),
      },
      output: { 
        schema: z.object({})
      },
    },  
  },
  events: {
    aftershipEvent: {
      title: 'AfterShip Event',
      description: 'This event is received when a tracking update occurs in AfterShip.',
      schema: z.object({
        ts: z.number().describe('UTC unix timestamp that the event occurred'),
        event: z.string().describe('The code of the event'),
        event_id: z.string().uuid().describe('UUID v4 format, to uniquely identify the webhook event'),
        is_tracking_first_tag: z.boolean().describe('Indicates if it is the first tracking update sent under a specific delivery tag'),
        msg: z.object({
          tracking_number: z.string().describe('The tracking number of the shipment'),
          carrier: z.string().describe('The carrier handling the shipment'),
          status: z.string().describe('Current status of the shipment'),
          checkpoint: z.array(
            z.object({
              message: z.string().describe('Detailed message of the checkpoint'),
              time: z.string().describe('Time of the checkpoint in ISO 8601 format'),
            })
          ).describe('List of checkpoints for the shipment')
        }).passthrough(),
      }).passthrough(),
    }
  },
})
