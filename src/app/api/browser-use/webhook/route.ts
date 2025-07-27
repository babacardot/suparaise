import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const WEBHOOK_SECRET = process.env.BROWSERUSE_WEBHOOK_SECRET!
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!
if (!WEBHOOK_SECRET || !INTERNAL_API_SECRET) {
  console.error(
    'BROWSERUSE_WEBHOOK_SECRET or INTERNAL_API_SECRET is not set. Webhook verification will fail.',
    {
      hasWebhookSecret: !!WEBHOOK_SECRET,
      hasInternalSecret: !!INTERNAL_API_SECRET,
    },
  )
}

type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

const verifySignature = (
  payload: string,
  timestamp: string,
  receivedSignature: string,
): boolean => {
  console.log('Verifying signature:', {
    hasWebhookSecret: !!WEBHOOK_SECRET,
    timestampLength: timestamp?.length,
    signatureLength: receivedSignature?.length,
    payloadLength: payload?.length,
  })

  if (!WEBHOOK_SECRET) {
    console.error('No WEBHOOK_SECRET available for signature verification')
    return false
  }
  const message = `${timestamp}.${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(message)
    .digest('hex')

  console.log('Signature verification details:', {
    expectedSignatureLength: expectedSignature.length,
    receivedSignatureLength: receivedSignature.length,
    expectedPrefix: expectedSignature.substring(0, 10),
    receivedPrefix: receivedSignature.substring(0, 10),
  })

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature),
    )
  } catch (error) {
    console.error('Error in signature verification:', error)
    return false
  }
}

const mapStatus = (browserUseStatus: string): SubmissionStatus | null => {
  switch (browserUseStatus) {
    case 'started':
    case 'initializing':
    case 'paused':
      return 'in_progress'
    // Final statuses will be handled by the result processor
    case 'finished':
    case 'stopped':
    case 'failed':
      return null // No direct update, trigger result processing instead
    default:
      console.warn(`Unknown status received: ${browserUseStatus}`)
      return null
  }
}

const updateSubmissionStatus = async (
  taskId: string,
  status: SubmissionStatus,
) => {
  const tables = ['submissions', 'angel_submissions', 'accelerator_submissions']
  let found = false

  for (const table of tables) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('session_id', taskId)
      .select('id')

    if (error && error.code !== 'PGRST204') {
      console.error(
        `Error updating table ${table} for task ${taskId}:`,
        error.message,
      )
    } else if (data && data.length > 0) {
      console.log(
        `✅ Updated submission in ${table} (ID: ${data[0].id}) for task ${taskId} to status: ${status}`,
      )
      found = true
      break
    }
  }

  if (!found) {
    console.warn(
      `⚠️ No submission found with task_id (session_id) ${taskId} in any table.`,
    )
  }
}

const triggerResultProcessing = (taskId: string) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/agent/process-result`
  console.log(`Triggering result processing for task ${taskId} at ${url}`)

  // Fire-and-forget the request
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${INTERNAL_API_SECRET}`,
    },
    body: JSON.stringify({ taskId }),
  }).catch((err) => {
    console.error(
      `Failed to trigger result processing for task ${taskId}:`,
      err,
    )
  })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const timestamp = request.headers.get('X-Browser-Use-Timestamp')
  const signature = request.headers.get('X-Browser-Use-Signature')

  console.log('Webhook received:', {
    hasBody: !!rawBody,
    bodyLength: rawBody?.length,
    hasTimestamp: !!timestamp,
    hasSignature: !!signature,
    timestamp,
    signature,
    headers: Object.fromEntries(request.headers.entries()),
  })

  // Check if this is a test event first (before header validation)
  let event
  try {
    event = JSON.parse(rawBody)
  } catch (error) {
    console.error('Failed to parse webhook body:', error)
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  // Allow test events to pass without headers or signature verification for setup
  if (event.type === 'test') {
    console.log(
      '✅ Received Browser Use test webhook (bypassing all verification for setup).',
    )
    return NextResponse.json({
      status: 'success',
      message: 'Test webhook received',
    })
  }

  // For non-test events, require headers and signature
  if (!timestamp || !signature) {
    console.error('Missing required headers for non-test event:', {
      timestamp,
      signature,
    })
    return NextResponse.json(
      { error: 'Missing timestamp or signature headers' },
      { status: 400 },
    )
  }

  if (!verifySignature(rawBody, timestamp, signature)) {
    console.error('Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  // Event was already parsed above and test events were handled

  if (event.type !== 'agent.task.status_update') {
    return NextResponse.json({
      status: 'success',
      message: `Ignoring unhandled event type: ${event.type}`,
    })
  }

  const { task_id, status: browserUseStatus } = event.payload
  if (!task_id || !browserUseStatus) {
    return NextResponse.json(
      { error: 'Missing task_id or status in payload' },
      { status: 400 },
    )
  }

  const isFinalStatus = ['finished', 'failed', 'stopped'].includes(
    browserUseStatus,
  )

  if (isFinalStatus) {
    // For final statuses, trigger the detailed result processing
    triggerResultProcessing(task_id)
    return NextResponse.json({
      status: 'success',
      message: 'Final result processing triggered.',
    })
  }

  const submissionStatus = mapStatus(browserUseStatus)
  if (!submissionStatus) {
    return NextResponse.json({
      status: 'success',
      message: 'Unknown or unhandled status',
    })
  }

  try {
    await updateSubmissionStatus(task_id, submissionStatus)
    return NextResponse.json({
      status: 'success',
      message: 'Webhook processed',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Error processing webhook:', errorMessage)
    return NextResponse.json(
      { error: 'Internal server error while processing webhook' },
      { status: 500 },
    )
  }
}
