import unfetch from 'isomorphic-unfetch'

let fetch: any
if (typeof window === 'undefined') {
  fetch = unfetch
} else {
  fetch = window.fetch.bind(window)
}

export class Fetch {
  /**
   * Page size to use for fetching orders
   */
  public apiBaseUrl: string
  public authToken: string
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  constructor(url: string, logger?: (arg: string) => void) {
    this.apiBaseUrl = url
    this.authToken = ''
    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg)
  }

  /**
   * Get JSON data from API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param query Data to send. Will be stringified using QueryString
   */
  public async get(url: string): Promise<any> {
    // const qs = QueryString.stringify(query)
    // const url = `${apiPath}?${qs}`

    const response = await this._fetch(url)
    return response.json()
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async post(apiPath: string, body?: { [key: string]: any }, opts: RequestInit = {}): Promise<any> {
    const fetchOpts = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      ...opts
    }

    const response = await this._fetch(apiPath, fetchOpts)
    if (response.ok) {
      const resJson: any = await response.json()
      if (resJson.data) {
        return resJson.data
      } else {
        return resJson
      }
    } else {
      return response
    }
  }

  /**
   * PUT JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async put(apiPath: string, body: any, opts: RequestInit = {}) {
    return this.post(apiPath, body, {
      method: 'PUT',
      ...opts
    })
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  private async _fetch(apiPath: string, opts: RequestInit = {}) {
    const apiBase = this.apiBaseUrl
    const token = this.authToken
    const finalUrl = apiBase + apiPath
    const finalOpts = {
      ...opts,
      headers: {
        ...(token ? { Authorization: token } : {}),
        ...(opts.headers || {})
      }
    }

    this.logger(`Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(0, 100)}...`)
    return fetch(finalUrl, finalOpts).then(async (res: any) => this._handleApiResponse(res))
  }

  private async _handleApiResponse(response: Response) {
    if (response.ok) {
      this.logger(`Got success: ${response.status}`)
      return response
    }

    let result
    let errorMessage
    try {
      result = await response.text()
      result = JSON.parse(result)
    } catch {
      // Result will be undefined or text
    }

    this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`)

    switch (response.status) {
      case 400:
        errorMessage = result && result.errors ? result.errors.join(', ') : `Invalid request: ${JSON.stringify(result)}`
        break
      case 401:
      case 403:
        errorMessage = `Unauthorized. Full message was '${JSON.stringify(result)}'`
        break
      case 404:
        errorMessage = `Not found. Full message was '${JSON.stringify(result)}'`
        break
      case 500:
        errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`
        break
      case 503:
        errorMessage = `Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`
        break
      default:
        errorMessage = `Message: ${JSON.stringify(result)}`
        break
    }

    throw new Error(`API Error ${response.status}: ${errorMessage}`)
  }

  public throwOrContinue(error: Error, retries: number) {
    const isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'))
    if (retries <= 0 || !isUnavailable) {
      throw error
    }
  }
}
