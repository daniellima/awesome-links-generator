module.exports = class PocketAuthenticator {
    constructor(httpClient) {
        this.client = httpClient
    }

    async getRequestCode(consumerKey) {
        const response = await this.client
            .post('https://getpocket.com/v3/oauth/request')
            .send({
                'consumer_key': consumerKey,
                'redirect_uri': 'pocketapp1234:authorizationFinished'
            })

        return response.body.code;
    }

    async generateAccessToken(consumerKey, requestCode) {
        try {
            const response = await this.client
                .post('https://getpocket.com/v3/oauth/authorize')
                .send({
                    'consumer_key': consumerKey,
                    'code': requestCode
                })

            return response.body.access_token
        }
        catch(error) {
            if (error.status === 403) {
                throw Error(`It appears that you have not authorized this requestCode. Try again please. Original Error: ${error.status}: ${error.response.text}`)
            }

            throw Error(`An error ocurred when trying to generate a access token. Original Error: ${error.status}: ${error.response.text}`)
        }
    }
}