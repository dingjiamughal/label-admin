module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const label = new Schema({
        __v: {type: Number, select: false},
        name: {type: String, required: true},
        count: {type: String, required: true},
        taskId: {type: String, required: true}
    });

    return mongoose.model('Label', label);
};
