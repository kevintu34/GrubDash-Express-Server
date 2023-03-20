const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
    res.json({data: dishes})
}

function validateBodyExists(req, res, next) {
    const data = req.body.data
    if(data) {
        next()
    } else {
        next({
            status: 400,
            message: `Request must include data`
        })
    }
}

function validateTextExistsFunction(field) {
    const validateTextExists = (req, res, next) => {
        if(req.body.data[field]) {
            //stores request body data for later use
            res.locals[field] = req.body.data[field]
            next()
        } else {
            next({
                status: 400,
                message: `Dish must include a ${field}`
            })
        }
    }
    return validateTextExists
}

function validatePrice(req, res, next) {
    if(typeof res.locals.price === "number" && res.locals.price > 0) {
        next()
    } else {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    }
}

function create(req, res, next) {
    const newDish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

function validateDishExists(req, res, next) {
    const {dishId} = req.params
    //searches for index number of dishId in params
    const foundIndex = dishes.findIndex(dish=>dish.id === dishId)
    if(foundIndex < 0) {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}.`
        })
    } else {
        //stores for later use
        res.locals.foundIndex = foundIndex
        res.locals.foundDish = dishes[foundIndex]
        next()
    }
}

function read(req, res, next) {
    res.json({data: res.locals.foundDish})
}

function validateBodyId(req, res, next) {
    const {id} = req.body.data
    const {dishId} = req.params
    //if the id exists, check if it checks the dishId in params
    if(id) {
        if(id === dishId) {
            next()
        } else {
            next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        }
    } else {
        next()
    }
}

function update(req, res, next) {
    //spread foundDish to populate with id
    const updatedDish = {
        ...res.locals.foundDish,
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url
    }
    //removes at the foundIndex and replaces with updatedDish
    dishes.splice(res.locals.foundIndex, 1, updatedDish)
    res.json({data: updatedDish})
}

module.exports = {
    list,
    create: [
        validateBodyExists,
        ...["name", "description", "price", "image_url"].map(field=>validateTextExistsFunction(field)),
        validatePrice,
        create
    ],
    read: [
        validateDishExists,
        read
    ],
    update: [
        validateDishExists,
        validateBodyExists,
        ...["name", "description", "price", "image_url"].map(field=>validateTextExistsFunction(field)),
        validatePrice,
        validateBodyId,
        update
    ]
}