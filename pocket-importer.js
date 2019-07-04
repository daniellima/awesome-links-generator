const superagent = require("superagent")
const cli = require('./cli')
const PocketAuthenticator = require('./pocket-authenticator')
const PocketClient = require('./pocket-client')
const generateChromeBookmarks = require('./generate-chrome-bookmarks')

async function main() {

    const pocketAuthenticator = new PocketAuthenticator(superagent)

    const consumerKey = cli.getConsumerKey()

    const {accessToken, accessTokenInEnv} = await cli.getAccessToken(consumerKey, pocketAuthenticator)

    if (!accessTokenInEnv) {
        console.log(`You have logged to Pocket sucessfully! Your access token is ${accessToken}. Please, set it as the POCKET_ACCESS_TOKEN env var and execute this script again.`)
        return
    }

    const pocketClient = new PocketClient(superagent, consumerKey, accessToken)

    const articles = await pocketClient.getAllPinnedArticles()

    await generateChromeBookmarks(articles, './bookmarks.html')

    console.log(`${articles.length} bookmarks saved to bookmarks.html`)
}


main()
    .catch(error => {
        process.exitCode = 1
        console.log(`Program exited with error: ${error}`)
    })
