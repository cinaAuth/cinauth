import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#F97316',
  letterSpacing: '0.3em',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#71717a', margin: '30px 0 0' }
