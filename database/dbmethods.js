
const fs = require("fs")
const _ = require("lodash")
function findOneSubsetObject(array, testObject) {
    return _.find(array, obj => _.isMatch(obj, testObject));
}
function findManySubsetObject(array, testObject) {
    return _.filter(array, obj => _.isMatch(obj, testObject));
}
function findOne(name, query, givenData) {
    if (givenData) {
        const targetData = findOneSubsetObject(givenData[name], query)
        return targetData;
    }
    try {
        const data = JSON.parse(fs.readFileSync("C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/database/database.json", "utf-8"));
        const targetData = findOneSubsetObject(data[name], query)
        return targetData;
    }
    catch (error) {
        throw new Error(error)
    }

}
function findMany(name, query) {
    try {
        const data = JSON.parse(fs.readFileSync("C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/database/database.json", "utf-8"));
        const targetData = findManySubsetObject(data[name], query)
        return targetData;


    }
    catch (error) {
        throw new Error(error)
    }

}


function inserOne(name, object) {
    try {
        const data = JSON.parse(fs.readFileSync("C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/database/database.json", "utf-8"));
        data[name].push(object);
        fs.writeFileSync("C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/database/database.json", JSON.stringify(data));

    }
    catch (error) {
        throw new Error(error)
    }

}

function updateOne(name, test, field, obj) {
    try {
        // Read the JSON file and parse its contents
        const filePath = "C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/database/database.json";
        let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Find the target object based on the name and test condition
        let target = findOne(name, test, data);
        let index = data[name].indexOf(target)

        // If the target object is found, update the specified field with the new value
        if (target) {
            // console.log("target", data)
            target[field] = obj;

            // Write the updated data back to the JSON file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } else {
            console.log("Target object not found.");
        }

    } catch (error) {
        throw new Error(error);
    }
}



module.exports = { findOne, findMany, inserOne, updateOne }