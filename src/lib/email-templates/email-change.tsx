import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You requested to change your email address for {siteName} from{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Click the button below to confirm this change:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footer}>
          If you didn't request this change, please secure your account
          immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#0A0A0A', fontFamily: "'JetBrains Mono', 'Courier New', monospace", padding: '24px 0' }
const container = { padding: '32px 28px', backgroundColor: '#111111', border: '1px solid #27272a', borderLeft: '3px solid #F97316', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#fafafa',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#a1a1aa',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: '#F97316', textDecoration: 'underline' }
const button = {
  backgroundColor: '#F97316',
  color: '#0A0A0A',
  fontSize: '14px',
  border: '1px solid #F97316',
  borderRadius: '0',
  fontWeight: 'bold' as const,
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#71717a', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #F97316 !important; color: #0A0A0A !important; }
  }
  [data-ogsc] .dm-btn { background-color: #F97316 !important; color: #0A0A0A !important; }
  [data-ogsb] .dm-btn { background-color: #F97316 !important; color: #0A0A0A !important; }
`
