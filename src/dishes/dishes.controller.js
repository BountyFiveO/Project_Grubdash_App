const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

// <<------- VALIDATION ------->>
function dishExists(request, response, next) {
  const dishId = request.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
// if foundDish is truthy, then it exists
  if (foundDish) {
    response.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}
// create function to check if dishId is Absent or Matches it should have request, response, next as parameters
function dishIdAbsentOrMatches(request, response, next) {
  const {
    data: { id },
  } = request.body;
//  assign dishId to request.params.dishId
  const dishId = request.params.dishId;
//  check if id is truthy or if dishId is equal to id
  if (!id || dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}
//  create functions dishHasName, dishHasDescription, dishHasPrice, dishHasImageUrl
// each function should have request, response, next as parameters
//  start with dishHasName
function dishHasName(request, response, next) {
  const {
    data: { name },
  } = request.body;

  if (!name || name === "") {
    next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  response.locals.name = name;
  next();
}
//  next function dishHasDescription
function dishHasDescription(request, response, next) {
  const {
    data: { description },
  } = request.body;

  if (!description || description === "") {
    next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  response.locals.description = description;
  next();
}
//  next function dishHasPrice
function dishHasPrice(request, response, next) {
  const {
    data: { price },
  } = request.body;

  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }

  response.locals.price = price;
  next();
}
//  next function priceIsPositiveInteger
function priceIsPositiveInteger(request, response, next) {
  const price = response.locals.price;
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  next();
}
// next function dishHasImageUrl
function dishHasImageUrl(request, response, next) {
  const {
    data: { image_url },
  } = request.body;

  if (!image_url || image_url === "") {
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }

  response.locals.image_url = image_url;
  next();
}

// <<-------   ROUTES   ------->>

//  create function create with request, response, next as parameters. purpose of create function is to create a new dish
function create(request, response, next) {
  const {
    data: { name, description, price, image_url },
  } = request.body;
  const id = nextId();
  const newDish = {
    id,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  response.status(201).json({ data: newDish });
}

//  create function read with request, response, next as parameters. purpose of read function is to read a dish
function read(request, response, next) {
  response.json({ data: response.locals.dish });
}
// this update function will update a dish 
function update(request, response, next) {
  const dish = response.locals.dish;
  const { name, description, price, image_url } = response.locals;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  response.json({ data: dish });
}

// the list function will list all dishes
function list(request, response, next) {
  response.json({ data: dishes });
}
//  lets export the functions
module.exports = {
  create: [
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    priceIsPositiveInteger,
    dishHasImageUrl,
    create,
  ],
  update: [
    dishExists,
    dishIdAbsentOrMatches,
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    priceIsPositiveInteger,
    dishHasImageUrl,
    update,
  ],
  read: [dishExists, read],
  list,
};
