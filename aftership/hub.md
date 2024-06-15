## What it is
A simply great integration to connect your Aftership account with your Botpress Bot. Track shipments in real-time and notify users directly through your bot when updates occur.

## How it works
Upon enabling the integration, a Webhook Subscription is configured for your Aftership account using the provided `API Key`. This webhook sends updates to the integration whenever there is a significant change in the tracking status of a shipment.
The `Track Shipment` action can be used to initiate tracking of a shipment. It requires a `Tracking Number` and utilizes Aftership's API to fetch and monitor shipment status, embedding a unique `Conversation Id` inside the tracking data. This Id is then used to trigger the `Aftership Event` within the conversation, enabling your bot to respond to shipping updates.

`Conversation Id` is a unique identifier for each conversation. You can pass `{{event.conversationId}}` into this field to embed your ID. When receiving an Aftership update, you can use `{{event.payload.conversation.id}}` in the Advanced Options `Conversation ID` field of the `Aftership Event Trigger`. This directs the update to the appropriate conversation.

You can view the full integration code on the Simply Great Bots Git page: [Aftership Repo](https://github.com/SimplyGreatBots/aftership)

### Aftership Setup

#### Getting API Key
1. Go to [Aftership Admin Dashboard](https://admin.aftership.com/).
2. Navigate to `Developers` -> `API Keys`.
3. Click on `Create API Key`, name your key, and select `Save`.
4. Copy and paste your API Key somewhere safe, you will need it during the Botpress setup.

#### Adding Webhook
1. Navigate to [Tracking Dashboard -> Notifications -> Webhooks](https://admin.aftership.com/notifications/webhooks#).
2. Copy your Webhook Secret and paste it somewhere safe. You will need this during the Botpress setup.
3. Click on `Add Webhook`.
4. Set the webhook version to the default "Legacy".
5. Paste the Webhook URL from your Botpress Aftership integration into the `Webhook URL` field.
6. Save the webhook settings.

### Botpress Setup
1. Copy and paste your Aftership API key from the Aftership Setup into the `API Key` field.
2. Copy and paste your `Webhook Secret` from the Aftership Setup into your `Secret` field.
