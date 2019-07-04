const superagent = require("superagent")
const _ = require('lodash')
const util = require('util')


const cli = require('./cli')
const PocketAuthenticator = require('./pocket-authenticator')
const PocketClient = require('./pocket-client')

async function main() {

    const pocketAuthenticator = new PocketAuthenticator(superagent)

    const consumerKey = cli.getConsumerKey()

    const {accessToken, accessTokenInEnv} = await cli.getAccessToken(consumerKey, pocketAuthenticator)

    if (!accessTokenInEnv) {
        console.log(`You have logged to Pocket sucessfully! Your access token is ${accessToken}. Please, set it as the POCKET_ACCESS_TOKEN env var and execute this script again.`)
        return
    }

    const pocketClient = new PocketClient(superagent, consumerKey, accessToken)

    const links = await pocketClient.getAllPinnedArticles()

    console.log(_.values(links).length)
    console.log(_.filter(links, article => article.status === '1').length)
}


main()
    .catch(error => {
        process.exitCode = 1
        console.log(`Program exited with error: ${error}`)
    })
