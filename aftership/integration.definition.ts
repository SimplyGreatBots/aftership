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
          conversationId: z.string().describe('Id of the conversation'),
          trackingNumber: z.string().describe('Tracking number of the shipment'),
          slug: z.string().describe('Unique courier code').optional(),
          title: z.string().describe('Custom title for the tracking (defaults to tracking number)').optional(),
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
          conversation: z.object({
            id: z.string().describe('ID of the conversation'),
          }),
          data: z.record(z.any()),
        }).passthrough(),
    }
  },
})
