const mustache = require('mustache')
const fs = require('fs').promises

module.exports = async function generateChromeBookmarks(articles, destinationFilePath) {
    const data = await fs.readFile('./bookmarks.mst')

    const renderedFile = mustache.render(data.toString(), {
        folderName: 'Inbox',
        articles: articles
    })

    return fs.writeFile(destinationFilePath, renderedFile)
}
