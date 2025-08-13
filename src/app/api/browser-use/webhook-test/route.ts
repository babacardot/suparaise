import { NextRequest, NextResponse } from 'next/server'

/**
 * SIMPLE WEBHOOK TEST ENDPOINT
 * This endpoint bypasses all signature verification for debugging
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 WEBHOOK TEST - Received webhook call')
    
    // Log all headers
    const headers = Object.fromEntries(request.headers.entries())
    console.log('📋 Headers:', headers)
    
    // Get the raw body
    const rawBody = await request.text()
    console.log('📦 Raw Body:', rawBody)
    
    // Try to parse as JSON
    let parsedBody
    try {
      parsedBody = JSON.parse(rawBody)
      console.log('✅ Parsed JSON Body:', parsedBody)
    } catch (error) {
      console.log('❌ Failed to parse JSON:', error)
      parsedBody = { error: 'Invalid JSON', rawBody }
    }
    
    // Log specific webhook headers we're looking for
    const timestamp = request.headers.get('X-Browser-Use-Timestamp')
    const signature = request.headers.get('X-Browser-Use-Signature')
    
    console.log('🔐 Webhook Headers:')
    console.log('  - Timestamp:', timestamp)
    console.log('  - Signature:', signature)
    
    // If it's a test event, handle it specially
    if (parsedBody.type === 'test') {
      console.log('🧪 Test webhook detected')
      return NextResponse.json({
        status: 'success',
        message: 'Test webhook received successfully',
        timestamp: new Date().toISOString(),
      })
    }
    
    // For actual events, log the details
    if (parsedBody.type === 'agent.task.status_update') {
      console.log('🤖 Agent task status update:')
      console.log('  - Task ID:', parsedBody.payload?.task_id)
      console.log('  - Session ID:', parsedBody.payload?.session_id)
      console.log('  - Status:', parsedBody.payload?.status)
    }
    
    // Always return success for testing
    return NextResponse.json({
      status: 'success',
      message: 'Webhook test endpoint - received and logged',
      receivedData: {
        type: parsedBody.type,
        hasTimestamp: !!timestamp,
        hasSignature: !!signature,
        bodyLength: rawBody.length,
      }
    })
    
  } catch (error) {
    console.error('❌ Webhook test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also handle GET for simple testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Browser Use webhook test endpoint is running',
    timestamp: new Date().toISOString(),
    endpoint: '/api/browser-use/webhook-test'
  })
}
