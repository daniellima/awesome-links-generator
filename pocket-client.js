const Article = require('./article')
const _ = require('lodash')

module.exports = class PocketClient {
    constructor(httpClient, consumerKey, accessToken) {
        this.client = httpClient
        this.consumerKey = consumerKey
        this.accessToken = accessToken
    }

    async getArticlesByTag(tag_name) {
        const response = await this.client
            .get('https://getpocket.com/v3/get')
            .send({
                'consumer_key': this.consumerKey,
                'access_token': this.accessToken,
                'state': 'all',
                'tag': tag_name,
                'sort': 'newest',
                'detailType': 'simple'
            })

        const pocketArticles = _.values(response.body.list)
        // Sorting is necessary because superagent don't maintain the order when parsing the response
        const sortedPocketArticles = _.sortBy(pocketArticles, e => e.sort_id)
        
        const articles = sortedPocketArticles.map(article => {
            // Not all articles have a resolved_title and given_title. Some, specially PDF files, don't have any
            let title = article.resolved_url
            
            if (article.resolved_title !== "") {
                title = article.resolved_title
            }
            else if (article.given_title !== "") {
                title = article.given_title
            }
            return new Article(title, article.given_url)
        })
            
        return articles
    }
}