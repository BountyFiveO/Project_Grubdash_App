const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(request, response, next) {
	const { orderId } = request.params;
	const foundOrder = orders.find((order) => order.id === orderId);

	if (foundOrder) {
		response.locals.order = foundOrder;
		return next();
	}
	next({
		status: 404,
		message: `Order id ${orderId} does not exist`,
	});
}
//  create functions orderHasStatus, orderHasDeliverTo, orderHasMobileNumber, orderHasDish and dishesMustBeNonEmptyArray they should all
// have request, response, next as parameters and use next() to move to the next function
//  they all do the same thing just with different properties and values so comments will be on this top function....
function orderRequiresDeliverTo(request, response, next) {
	// destructure deliverTo from request.body.data
	const {
		data: { deliverTo },
	} = request.body;
	//  if deliverTo is falsy or deliverTo is an empty string then return next with an object with status and message properties
	if (!deliverTo || deliverTo === "") {
		next({
			status: 400,
			message: "Order must include a deliverTo",
		});
	}
	// the response.locals.deliverTo is equal to deliverTo and then return next()
	response.locals.deliverTo = deliverTo;
	next();
}

function orderRequiresMobileNumber(request, response, next) {
	const {
		data: { mobileNumber },
	} = request.body;

	if (!mobileNumber || mobileNumber === "") {
		next({
			status: 400,
			message: "Order must include a mobileNumber",
		});
	}

	response.locals.mobileNumber = mobileNumber;
	next();
}

function orderRequiresDish(request, response, next) {
	const {
		data: { dishes },
	} = request.body;

	if (!dishes) {
		next({
			status: 400,
			message: "Order must include a dish",
		});
	}

	response.locals.dishes = dishes;
	next();
}

function dishesMustBeNonEmptyArray(request, response, next) {
	dishes = response.locals.dishes;

	if (!Array.isArray(dishes) || dishes.length === 0) {
		return next({
			status: 400,
			message: "Order must include at least one dish",
		});
	}

	next();
}

function eachDishMustHaveQuantityAboveZero(request, response, next) {
	dishes = response.locals.dishes;

	for (let i = 0; i < dishes.length; i++) {
		if (
			!dishes[i].quantity ||
			!(dishes[i].quantity > 0) ||
			!Number.isInteger(dishes[i].quantity)
		) {
			return next({
				status: 400,
				message: `Dish ${i} must have a quantity that is an integer greater than 0`,
			});
		}
	}

	next();
}

function orderIdAbsentOrMatches(request, response, next) {
	const {
		data: { id },
	} = request.body;

	const orderId = request.params.orderId;

	if (!id || orderId === id) {
		return next();
	}
	next({
		status: 400,
		message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
	});
}

function statusMustExistAndBeValid(request, response, next) {
	const {
		data: { status },
	} = request.body;

	if (
		status &&
		(status === "pending" ||
			status === "preparing" ||
			status === "out-for-delivery" ||
			status === "delivered")
	) {
		response.locals.status = status;
		next();
	}
	next({
		status: 400,
		message:
			"Order must have a status of pending, preparing, out-for-delivery, delivered",
	});
}

function orderStatusIsPending(request, response, next) {
	const { order } = response.locals;
	if (order.status === "pending") {
		next();
	}
	next({
		status: 400,
		message: "An order cannot be deleted unless it is pending",
	});
}
// <<-------   ROUTES   ------->>

//  creates a new order
function create(request, response, next) {
	const { deliverTo, mobileNumber, dishes } = response.locals;
	const { status = "pending" } = request.body;
	const id = nextId();
	const newOrder = {
		id,
		deliverTo,
		mobileNumber,
		status,
		dishes,
	};
	orders.push(newOrder);
	response.status(201).json({ data: newOrder });
}

function read(request, response, next) {
	response.json({ data: response.locals.order });
}
//  updates an order
function update(request, response, next) {
	const order = response.locals.order;
	const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
		request.body;
	order.deliverTo = deliverTo;
	order.mobileNumber = mobileNumber;
	order.status = status;
	order.dishes = dishes;

	response.json({ data: order });
}
//  deletes an order
function destroy(request, response, next) {
	const { orderId } = request.params;
	const index = orders.findIndex((order) => order.id === orderId);
	orders.splice(index, 1);
	response.sendStatus(204);
}
//  lists all orders
function list(request, response, next) {
	response.json({ data: orders });
}
//  <<-------   EXPORTS   ------->>
module.exports = {
	create: [
		orderRequiresDeliverTo,
		orderRequiresMobileNumber,
		orderRequiresDish,
		dishesMustBeNonEmptyArray,
		eachDishMustHaveQuantityAboveZero,
		create,
	],
	read: [orderExists, read],
	update: [
		orderExists,
		statusMustExistAndBeValid,
		orderIdAbsentOrMatches,
		orderRequiresDeliverTo,
		orderRequiresMobileNumber,
		orderRequiresDish,
		dishesMustBeNonEmptyArray,
		eachDishMustHaveQuantityAboveZero,
		update,
	],
	delete: [orderExists, orderStatusIsPending, destroy],
	list,
};
