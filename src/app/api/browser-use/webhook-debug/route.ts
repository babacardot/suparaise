import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * DEBUG WEBHOOK ENDPOINT - Same signature verification logic but with detailed logging
 */
export async function POST(request: NextRequest) {
  console.log('🔍 WEBHOOK DEBUG - Starting signature verification debug')
  
  const WEBHOOK_SECRET = process.env.BROWSERUSE_WEBHOOK_SECRET
  
  console.log('🔐 Environment check:', {
    hasWebhookSecret: !!WEBHOOK_SECRET,
    secretLength: WEBHOOK_SECRET?.length || 0,
    secretPreview: WEBHOOK_SECRET ? `${WEBHOOK_SECRET.substring(0, 8)}...` : 'NOT_SET'
  })
  
  const rawBody = await request.text()
  const timestamp = request.headers.get('X-Browser-Use-Timestamp')
  const receivedSignature = request.headers.get('X-Browser-Use-Signature')
  
  console.log('📦 Request data:', {
    bodyLength: rawBody.length,
    hasTimestamp: !!timestamp,
    hasSignature: !!receivedSignature,
    timestamp,
    receivedSignature,
    bodyPreview: rawBody.substring(0, 100),
  })
  
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({
      error: 'WEBHOOK_SECRET not configured',
      debug: {
        environmentVariables: Object.keys(process.env).filter(key => key.includes('WEBHOOK')),
        hasSecret: false
      }
    }, { status: 500 })
  }
  
  if (!timestamp || !receivedSignature) {
    return NextResponse.json({
      error: 'Missing required headers',
      debug: {
        headers: Object.fromEntries(request.headers.entries()),
        hasTimestamp: !!timestamp,
        hasSignature: !!receivedSignature
      }
    }, { status: 400 })
  }
  
  // Perform signature verification with detailed logging
  try {
    const message = `${timestamp}.${rawBody}`
    console.log('🔗 Message to sign:', {
      messageLength: message.length,
      messagePreview: message.substring(0, 50),
      timestampPart: timestamp,
      bodyPart: rawBody.substring(0, 30)
    })
    
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(message)
      .digest('hex')
    
    console.log('🔍 Signature comparison:', {
      expected: expectedSignature,
      received: receivedSignature,
      expectedLength: expectedSignature.length,
      receivedLength: receivedSignature.length,
      match: expectedSignature === receivedSignature
    })
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    )
    
    if (isValid) {
      console.log('✅ Signature verification PASSED')
      return NextResponse.json({
        status: 'success',
        message: 'Signature verification passed',
        debug: {
          signatureValid: true,
          timestamp,
          bodyLength: rawBody.length
        }
      })
    } else {
      console.log('❌ Signature verification FAILED')
      return NextResponse.json({
        error: 'Signature verification failed',
        debug: {
          expected: expectedSignature,
          received: receivedSignature,
          message: message.substring(0, 100),
          secretUsed: `${WEBHOOK_SECRET.substring(0, 8)}...`
        }
      }, { status: 403 })
    }
    
  } catch (error) {
    console.error('💥 Signature verification error:', error)
    return NextResponse.json({
      error: 'Signature verification error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        receivedSignature,
        bodyLength: rawBody.length
      }
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook debug endpoint',
    environment: {
      hasWebhookSecret: !!process.env.BROWSERUSE_WEBHOOK_SECRET,
      hasInternalSecret: !!process.env.INTERNAL_API_SECRET,
      webhookSecretLength: process.env.BROWSERUSE_WEBHOOK_SECRET?.length || 0,
    }
  })
}
