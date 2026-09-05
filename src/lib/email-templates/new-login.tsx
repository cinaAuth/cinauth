import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface NewLoginEmailProps {
  siteName?: string
  siteUrl?: string
  recipient?: string
  when?: string
  device?: string
  location?: string
  method?: string
}

export const NewLoginEmail = ({
  siteName = 'cinaAuth',
  siteUrl = 'https://cinauth.com',
  recipient = 'you',
  when = 'just now',
  device = 'Unknown device',
  location = 'Unknown location',
  method = 'Password',
}: NewLoginEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New login detected on your {siteName} account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New login detected</Heading>
        <Text style={text}>
          We noticed a new sign-in to your <strong>{siteName}</strong> account (
          {recipient}).
        </Text>
        <Section style={card}>
          <Text style={row}>
            <strong>When:</strong> {when}
          </Text>
          <Text style={row}>
            <strong>Device:</strong> {device}
          </Text>
          <Text style={row}>
            <strong>Location:</strong> {location}
          </Text>
          <Text style={row}>
            <strong>Method:</strong> {method}
          </Text>
        </Section>
        <Text style={text}>
          If this was you, no action is needed. If you don&apos;t recognise this
          activity, change your password immediately and enable two-factor
          authentication at{' '}
          <Link href={`${siteUrl}/panel/settings`} style={link}>
            your security settings
          </Link>
          .
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          You received this because security alerts are enabled on your{' '}
          {siteName} account.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '32px 24px',
  maxWidth: '560px',
}

const h1: React.CSSProperties = {
  color: '#0a0a0a',
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  margin: '0 0 16px',
}

const text: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const card: React.CSSProperties = {
  border: '1px solid #e4e4e7',
  borderLeft: '3px solid #f97316',
  padding: '16px 20px',
  margin: '0 0 20px',
  backgroundColor: '#fafafa',
}

const row: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}

const link: React.CSSProperties = { color: '#f97316', textDecoration: 'underline' }

const hr: React.CSSProperties = { borderColor: '#e4e4e7', margin: '24px 0' }

const footer: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
}

export const template = {
  component: NewLoginEmail,
  displayName: 'New login detected',
  subject: 'New login detected on your cinaAuth account',
  previewData: {
    siteName: 'cinaAuth',
    siteUrl: 'https://cinauth.com',
    recipient: 'user@example.com',
    when: 'Sat, 5 Sep 2026 20:02 UTC',
    device: 'Chrome on macOS',
    location: 'Madrid, Spain',
    method: 'Password',
  },
} satisfies TemplateEntry

export default NewLoginEmail
