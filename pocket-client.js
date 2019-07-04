module.exports = class PocketClient {
    constructor(httpClient, consumerKey, accessToken) {
        this.client = httpClient
        this.consumerKey = consumerKey
        this.accessToken = accessToken
    }

    async getAllPinnedArticles() {
        const response = await this.client
            .get('https://getpocket.com/v3/get')
            .send({
                'consumer_key': this.consumerKey,
                'access_token': this.accessToken,
                'state': 'all',
                'tag': 'pinned',
                'sort': 'newest',
                'detailType': 'simple'
            })
        
        return response.body.list
    }
}