module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const task = new Schema({
        __v: {type: Number, select: false},
        name: {type: String, required: true}
    });

    return mongoose.model('Task', task);
};
