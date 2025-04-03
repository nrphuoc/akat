import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { IntegrationConfig, IntegrationResponse, IntegrationError } from '../types/index.ts'
import { getIntegrationConfig, INTEGRATION_ERRORS } from '../config/integration.ts'

export class TokenService {
  private supabase
  private config: IntegrationConfig

  constructor() {
    this.config = getIntegrationConfig()
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    )
  }

  async getToken(provider: string): Promise<IntegrationResponse> {
    try {
      // Get token from database
      const { data: token, error: tokenError } = await this.supabase
        .from('oauth_tokens')
        .select('*')
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (tokenError) {
        throw tokenError
      }

      // Check if token is expired
      if (token && new Date(token.expiresAt) <= new Date()) {
        // Refresh token
        return this.refreshToken(provider, token.refreshToken)
      }

      return {
        success: true,
        data: token
      }
    } catch (error) {
      const integrationError = error as IntegrationError
      integrationError.code = INTEGRATION_ERRORS.OAUTH
      throw integrationError
    }
  }

  async refreshToken(
    provider: string,
    refreshToken: string
  ): Promise<IntegrationResponse> {
    try {
      // Get OAuth configuration
      const { data: oauthConfig, error: configError } = await this.supabase
        .from('oauth_configs')
        .select('*')
        .eq('provider', provider)
        .single()

      if (configError || !oauthConfig) {
        throw new Error(`OAuth config not found for provider: ${provider}`)
      }

      // Exchange refresh token for new access token
      const tokens = await this.exchangeRefreshToken(
        oauthConfig,
        refreshToken
      )

      // Store new tokens
      await this.supabase.from('oauth_tokens').insert({
        provider,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000)
      })

      return {
        success: true,
        data: tokens
      }
    } catch (error) {
      const integrationError = error as IntegrationError
      integrationError.code = INTEGRATION_ERRORS.OAUTH
      throw integrationError
    }
  }

  async revokeToken(provider: string): Promise<IntegrationResponse> {
    try {
      // Get OAuth configuration
      const { data: oauthConfig, error: configError } = await this.supabase
        .from('oauth_configs')
        .select('*')
        .eq('provider', provider)
        .single()

      if (configError || !oauthConfig) {
        throw new Error(`OAuth config not found for provider: ${provider}`)
      }

      // Get current token
      const { data: token, error: tokenError } = await this.supabase
        .from('oauth_tokens')
        .select('*')
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (tokenError) {
        throw tokenError
      }

      // Revoke token
      await this.revokeAccessToken(oauthConfig, token.accessToken)

      // Delete token from database
      await this.supabase
        .from('oauth_tokens')
        .delete()
        .eq('id', token.id)

      return {
        success: true,
        data: { revoked: true }
      }
    } catch (error) {
      const integrationError = error as IntegrationError
      integrationError.code = INTEGRATION_ERRORS.OAUTH
      throw integrationError
    }
  }

  private async exchangeRefreshToken(
    config: {
      clientId: string
      clientSecret: string
      tokenUrl: string
    },
    refreshToken: string
  ): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    }
  }

  private async revokeAccessToken(
    config: {
      clientId: string
      clientSecret: string
      revokeUrl: string
    },
    accessToken: string
  ): Promise<void> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      token: accessToken
    })

    const response = await fetch(config.revokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error('Failed to revoke token')
    }
  }
} 