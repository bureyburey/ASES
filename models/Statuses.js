var mongoose = require('mongoose');

var StatusSchema = new mongoose.Schema({
    curStatus: String,
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

StatusSchema.methods.edit = function(params, cb) {
    this.curStatus = params.curStatus;
    this.dateModified = new Date();
    this.save(cb);
};

mongoose.model('Status', StatusSchema);