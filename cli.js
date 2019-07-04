const prompts = require('prompts');

module.exports = {
    getConsumerKey() {
        const consumerKey = process.env['POCKET_CONSUMER_KEY']

        if (consumerKey === undefined) {
            throw Error('A environment variable named POCKET_CONSUMER_KEY must be defined. You can get it in https://getpocket.com/developer/apps/')
        }

        return consumerKey
    },

    async getAccessToken(consumerKey, pocketAuthenticator) {
        const error = Error('A environment variable named POCKET_ACCESS_TOKEN must be defined.')
        const accessToken = process.env['POCKET_ACCESS_TOKEN']

        if (accessToken !== undefined) return {
            accessToken: accessToken, 
            accessTokenInEnv: true
        }

        accessTokenInEnv = false

        const generateTokenResponse = await prompts({
            type: 'confirm',
            name: 'confirmed',
            message: 'The access token was not detected but the consumer key was. Do you want to generate an access token based on the consumer key?',
            initial: false
        });

        if (!generateTokenResponse.confirmed) throw error
        
        const requestCode = await pocketAuthenticator.getRequestCode(consumerKey)
        const url = `https://getpocket.com/auth/authorize?request_token=${requestCode}&redirect_uri=pocketapp1234:authorizationFinished`
        console.log(`Access ${url} and click Authorize.`)

        const authorizeAppResponse = await prompts({
            type: 'confirm',
            name: 'confirmed',
            message: `Have you authorized this app?`,
            initial: true
        });
        
        if (!authorizeAppResponse.confirmed) throw error
        
        return {
            accessToken: await pocketAuthenticator.generateAccessToken(consumerKey, requestCode), 
            accessTokenInEnv: false
        }
    }
}