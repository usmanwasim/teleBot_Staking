var mongoose = require("mongoose");

const dbConnect = () => {
	const connectionParams = { useNewUrlParser: true };
	mongoose.connect(process.env.MONGO_DB, connectionParams);

	mongoose.connection.on("connected", () => {
		console.log("Connected to database");
	});

	mongoose.connection.on("error", (err) => {
		console.log("Error connecting to database :" + err);
	});

	mongoose.connection.on("disconnected", () => {
		console.log("Disconnected from database");
	});
};

module.exports = dbConnect;
