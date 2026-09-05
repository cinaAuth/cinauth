import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

interface NewLoginInput {
  method?: string
  device?: string
  timeZone?: string
}

/** Envía el aviso "New login detected" al correo del usuario autenticado. */
export const notifyNewLogin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: NewLoginInput) => ({
    method: typeof input?.method === 'string' ? input.method.slice(0, 40) : 'Password',
    device: typeof input?.device === 'string' ? input.device.slice(0, 160) : 'Unknown device',
    timeZone: typeof input?.timeZone === 'string' ? input.timeZone.slice(0, 60) : 'Unknown location',
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context
    const { data: userData } = await supabase.auth.getUser()
    const email = userData?.user?.email
    if (!email) return { sent: false as const }

    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    try {
      const result = await sendTemplateEmail('new-login', email, {
        templateData: {
          siteName: 'cinaAuth',
          siteUrl: 'https://cinauth.com',
          recipient: email,
          when: new Date().toUTCString(),
          device: data.device,
          location: data.timeZone,
          method: data.method,
        },
        idempotencyKey: `new-login-${context.userId}-${Math.floor(Date.now() / 60000)}`,
      })
      return { sent: result.sent }
    } catch (error) {
      console.error('new-login email failed', error)
      return { sent: false as const }
    }
  })
