const fs = require('fs').promises
const path = require('path')
const _ = require('lodash')
const mustache = require('mustache')

const isBookmark = (p) => path.extname(p) === '.url'

async function buildBookmarkTree(start_path) {
    const name = path.basename(start_path)

    const paths = await fs.readdir(start_path, {withFileTypes: true})

    const dirPaths = paths.filter(p => p.isDirectory())
    const dirs = await Promise.all(dirPaths.map(async p => {
        const fullPath = path.join(start_path, p.name)
        return buildBookmarkTree(fullPath)
    }))

    const filePaths = paths.filter(p => p.isFile())
    const files = await Promise.all(filePaths.map(async p => {
        const fullPath = path.join(start_path, p.name)

        return {
            type: isBookmark(p.name) ? 'bookmark' : 'file',
            name: p.name.replace(/\.url$/g, ''),
            fullPath: path.join(start_path, p.name),
            url: isBookmark(p.name) ? await readURLFile(fullPath) : p.name
        }
    }))

    return {name, dirs, files}
}

async function readURLFile(fullPath) {
    const fileBytes = await fs.readFile(fullPath)
    const fileContent = fileBytes.toString()
    const url = fileContent.split("\n")[1].substring(4)
    
    return url
}

function filterBookmarkTree(tree, filter) {
    const files = tree.files.filter(file => filter(file, tree))
    const dirs = tree.dirs.map(dir => filterBookmarkTree(dir, filter))
    const dirsWithFiles = dirs.filter(dir => dir.dirs.length > 0 || dir.files.length > 0)

    return {name: tree.name, files, dirs: dirsWithFiles}
}

function removeReadMoreFolders(tree) {
    if(tree.files.length > 0) throw Error(`Folder ${tree.name} has links and is not _readmore_`)

    for (const dir of tree.dirs) {
        if (dir.name === '_readmore_') {
            if (dir.dirs.length > 0) {
                throw Error(`Readmore folder inside ${tree.name} has folders...`)
            }
    
            tree.files = dir.files
            continue
        }
        
        removeReadMoreFolders(dir)
    }

    tree.dirs = tree.dirs.filter(dir => dir.name !== '_readmore_')
}

function countNodes(tree) {
    let total = tree.files.length
    for (const dir of tree.dirs) {
        total += countNodes(dir)
    }

    return total
}

async function copyFilesFromTree(tree, destination) {
    for (const file of tree.files) {
        await fs.copyFile(file.fullPath, path.join(destination, file.name))
    }

    for (const dir of tree.dirs) {
        const newDirPath = path.join(destination, dir.name)
        await fs.mkdir(newDirPath)
        await copyFilesFromTree(dir, newDirPath)
    }
}

async function main() {
    const tree_path = path.resolve('../Tree')

    bookmarkTree = await buildBookmarkTree(tree_path)

    const unreadBookmarkTree = filterBookmarkTree(bookmarkTree, (file) => file.type === 'bookmark' && file.fullPath.indexOf('_readmore_') !== -1)
    removeReadMoreFolders(unreadBookmarkTree)
    unreadBookmarkTree.name = 'Unread'

    const readBookmarkTree = filterBookmarkTree(bookmarkTree, (file, parent) => file.type === 'bookmark' && parent.name !== '_readmore_')
    readBookmarkTree.name = 'Read'
    
    console.log('Done parsing!')
    
    const bookmarksMst = await fs.readFile('./bookmarks3.mst')
    
    const renderedFile = mustache.render(bookmarksMst.toString(), {
        name: 'Tree',
        dirs: [
            readBookmarkTree,
            unreadBookmarkTree
        ]
    }, {bookmarks3: bookmarksMst.toString()})
    
    await fs.writeFile('tree.html', renderedFile)
    
    console.log('Done writing HTML file')
    
    const penseira_path = path.resolve('../Penseira')
    
    const fileTree = filterBookmarkTree(bookmarkTree, (file) => file.type === 'file')
    
    await copyFilesFromTree(fileTree, penseira_path)

    console.log('Done copying files')

    console.log('All:', countNodes(bookmarkTree))
    console.log('Read:', countNodes(readBookmarkTree))
    console.log('Unread:', countNodes(unreadBookmarkTree))
    console.log('Files:', countNodes(fileTree))

}

main()