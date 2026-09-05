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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
