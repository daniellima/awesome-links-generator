const fs = require('fs').promises
const _ = require('lodash')
const mustache = require('mustache')

async function main() {
    const pinboard_exportJson = await fs.readFile('./pinboard_export.json')
    bookmarks = JSON.parse(pinboard_exportJson.toString())

    const toread = _.filter(bookmarks, link => link.toread === 'yes')
    const inbox = _.filter(bookmarks, link => link.toread === 'no')

    let tags = _.groupBy(inbox, link => link.tags)
    tags = _.mapKeys(tags, (value, key) => {
        return key.replace(/_/g, ' ')
    })
    tags = _.mapValues(tags, (value, key) => {return {'name': key, 'links':value}})
    tags = _.values(tags)
    tags = _.sortBy(tags, tag => tag.name)

    tags.unshift({
        'name': 'To Read',
        'links': toread
    })

    const bookmarksMst = await fs.readFile('./bookmarks2.mst')

    const renderedFile = mustache.render(bookmarksMst.toString(), {
        tags: tags
    })

    await fs.writeFile('pinboard.html', renderedFile)
    
    console.log(_.flatMap(tags, tag => tag.links).length)
}

main()