const nFs = require('fs');
const nPath = require('path');
const nGlob = require('glob');
const nUtil = require('util');

// Root directory is always project directory
process.chdir(nPath.join(__dirname, '..'));

function readDirR(path, tree, depth, glob) {
    if (depth + 1 < 0)
        return;
    if (nPath.basename(path).startsWith('.'))
        return;
    if (nPath.basename(path) === ('vfs.json'))
        return;

    const stats = nFs.statSync(path);
    if (stats.isDirectory()) {
        const subtree = {};
        nFs.readdirSync(path).forEach(f => readDirR(nPath.join(path, f), subtree, depth - 1));
        tree[nPath.basename(path)] = subtree;
    }
    if (stats.isFile()) {
        tree[nPath.basename(path)] = null;
    }
}

function generateIndex(path, depth = 0) {
    if (depth < 0) {
        return null;
    }

    const tree = {};
    readDirR(path, tree, depth);
    const index = Object.values(tree)[0];

    nFs.writeFile(nPath.join(path, 'vfs.json'), JSON.stringify(index), function (err) {
        if (err) return console.log(err);
    });

    return `Successfully generated ${ nPath.join(path, 'vfs.json') }.`;
}

console.log(generateIndex('./dist/pk2w/resources', Infinity));