import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click
          the button below to choose a new password.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
