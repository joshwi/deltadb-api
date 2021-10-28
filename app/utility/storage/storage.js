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

    let file = path.join(__dirname, `/../../static/${filepath}`)
    let output = ""

    // console.log(`No such file or directory: ${file}`)

    if(fs.existsSync(file)){
        if(file.indexOf(".json") > -1){
            output = fs.readFileSync(file, (err, data) => {
                if (err) return null;
                return data
            })
            try{ output = JSON.parse(output) } catch(error) { return null} 
        }else if(file.indexOf(".csv") > -1){
            output = fs.readFileSync(file, "utf-8", (err, data) => {
                if (err) return null;
                return data
            })
        }
    }

    return output
}

function write(filepath, filename, data) {

    let file = path.join(__dirname, `/../../static`)

    if (!fs.existsSync(file)) {
        fs.mkdirSync(file);
    }

    let folders = filepath.split(`/`)
    folders.map(subfolder => {
        if (!fs.existsSync(`${file}/${subfolder}`)) {
            fs.mkdirSync(`${file}/${subfolder}`);
        }
        file += `/${subfolder}`
    })

    file += `${filename}`

    let output = { message: `Data has been writen to file: ${file}` }
    try {
        if(filename.indexOf(".json") > -1){
            fs.writeFileSync(file, JSON.stringify(data))
        }else if(filename.indexOf(".csv") > -1){
            fs.writeFileSync(file, data)
        }
    } catch (err) {
        output = { message: `Error writing to file: ${file}`, error: err }
    }

    return output
}

module.exports = {scan, read, write}