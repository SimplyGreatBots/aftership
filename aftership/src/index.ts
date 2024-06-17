import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import axios from 'axios'
import { aftershipWebhookEventSchema, trackingResponseSchema } from './const'


export default new bp.Integration({
  register: async ({ logger, ctx }) => {
    logger.forBot().info(`Testing Aftership API key`)
  
    const apiKey = ctx.configuration.apiKey;
  
    const trackingOptions = {
      method: 'GET',
      url: 'https://api.aftership.com/v4/trackings',
      headers: {
        'Content-Type': 'application/json',
        'as-api-key': apiKey,
      },
      params: {},
    }
  
    try {
      const trackingResponse = await axios.request(trackingOptions)
      const validationResult = trackingResponseSchema.safeParse(trackingResponse.data)
  
      if (!validationResult.success) {
        logger.forBot().error(`Validation error: ${JSON.stringify(validationResult.error.issues)}`)
      }
      
      logger.forBot().info('Aftership API key validated')

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response ? error.response.status : 'No Status Code'
        const statusText = error.response ? error.response.statusText : 'No Status Text'
  
        if (statusCode === 401) {
          logger.forBot().error(errorCode401)
          throw new sdk.RuntimeError(errorCode401)
        } else {
          const detailedMessage = `Axios error - ${statusCode} ${statusText}: ${error.message}`
          throw new sdk.RuntimeError(detailedMessage);
        }
      } else {
        logger.forBot().error(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
        throw new sdk.RuntimeError(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
      }
    }
  },
  unregister: async () => {
  },
  actions: {
    createTracking: async (args): Promise<{}> => {
      args.logger.forBot().info('Creating Tracking')
      
      const apiKey = args.ctx.configuration.apiKey
      const trackingNumber = args.input.trackingNumber
      const slug = args.input.slug || ''
      const title = args.input.title || ''
      const conversationId = args.input.conversationId  

      var trackingOptions = {
        method: 'POST',
        url: 'https://api.aftership.com/tracking/2024-04/trackings',
        headers: {'Content-Type': 'application/json', 'as-api-key': apiKey },
        data: {
          tracking: {
            slug: slug,
            tracking_number: trackingNumber,
            title: title,
            custom_fields: {
              conversation_id: conversationId,
            }
          }
        }
      }
      try {
        const trackingResponse = await axios.request(trackingOptions)
        const validationResult = trackingResponseSchema.safeParse(trackingResponse.data)
    
        if (!validationResult.success) {
          args.logger.forBot().error(`Validation error: ${JSON.stringify(validationResult.error.issues)}`)
          return {}
        }

        args.logger.forBot().info('Tracking created');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const meta = error.response.data.meta
          const errorCodeMessage = getErrorCodeDescription(meta.code, meta.message)
          args.logger.forBot().error(`Error - ${meta.code} ${meta.type}: ${errorCodeMessage}`)
          throw new sdk.RuntimeError(`Error - ${meta.code} ${meta.type}: ${errorCodeMessage}`)
        } else {
          args.logger.forBot().error(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
          throw new sdk.RuntimeError(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
        }
      }

      return {}
    }
  },
  channels: {},
  handler: async ({ req, logger, client }) => {

    const bodyObject = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const parsedData = aftershipWebhookEventSchema.safeParse(bodyObject)
  
    if (!parsedData.success) {
      logger.forBot().info('Not an Aftership webhook event or event does not match aftership event schema:', parsedData.error)
      return
    }
    
    const conversation_id = parsedData.data.msg.custom_fields?.conversation_id;

    if (!conversation_id) {
      logger.forBot().error('No conversation ID found in the webhook payload.')
      throw new sdk.RuntimeError('No conversation ID found in the webhook payload.')
    }

    if (parsedData.data.is_tracking_first_tag) {
      try {
        const aftershipEvent = await client.createEvent({
          type: 'aftershipEvent',
          conversationId: conversation_id,
          payload: {
            conversation: {
              id: conversation_id
            },
            data: parsedData.data 
          },
        })
        
        logger.forBot().info('Aftership event created successfully.', aftershipEvent);
      } catch (error) {
        logger.forBot().error('Failed to create Aftership event:', error);
      }
    } else {
      logger.forBot().info('Non-initial tracking update received; no event created.');
    }
  }
})

function getErrorCodeDescription(code: number, defaultMessage: string) {
  const errorDescriptions: { [key: number]: string } = {
    400: "The request was invalid or cannot be otherwise served.",
    4001: "Invalid JSON data.",
    4003: "Tracking already exists.",
    4004: "Tracking does not exist.",
    4005: "The value of tracking_number is invalid.",
    4006: "Tracking object is required.",
    4007: "Tracking_number is required.",
    4008: "The value of a specific field is invalid.",
    4009: "A required field is missing.",
    401: "API Key is invalid or this account is not authorized to access tracking events. You must have an Aftership Pro plan or higher.",
    4010: "The value of slug is invalid.",
    4011: "Missing or invalid value of the required fields for this courier.",
    4012: "Unable to import shipment due to various carrier issues.",
    4013: "Retrack is not allowed. You can only retrack an inactive tracking.",
    403: "You must have an Aftership Pro plan or higher. The request has been refused or access is not allowed.",
    404: "The URI requested is invalid or the resource requested does not exist.",
    429: "You have exceeded the API call rate limit.",
    500: "Something went wrong on AfterShip's end."
  };

  return errorDescriptions[code] || defaultMessage;
}