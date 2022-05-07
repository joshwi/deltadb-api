const fs = require('fs')
const path = require("path")

function scan(directory) {
    // console.log(`No such directory: ${folder}`)
    let folder = path.join(__dirname, `/../../static/${directory}`)
    let output = []
    if(fs.existsSync(folder)){
        output = fs.readdirSync(folder, (err, files) => { if(err){ console.log(err); return [] }else{ return files } })
    }
    return output
}

function read(filepath) {

    if(fs.existsSync(filepath)){
        if(filepath.indexOf(".json") > -1){
            output = fs.readFileSync(filepath, (err, data) => {
                if (err) return null;
                return data
            })
            try{ output = JSON.parse(output) } catch(error) { return null} 
        }else if(filepath.indexOf(".csv") > -1){
            output = fs.readFileSync(filepath, "utf-8", (err, data) => {
                if (err) return null;
                return data
            })
        }
    }

    return output
}

function write(filename, data) {

    filepath = path.parse(filename).base

    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }

    let output = { message: `Data has been writen to file: ${filename}` }
    try {
        fs.writeFileSync(filename, data)
    } catch (err) {
        output = { message: `Error writing to file: ${filename}`, error: err }
    }

    return output
}

module.exports = {scan, read, write}