var mongoose = require('mongoose');
require('mongoose-double')(mongoose); // require Double data type

var UserCriteriaSchema = new mongoose.Schema({
    name: String,
    slug: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userForm: { type: mongoose.Schema.Types.ObjectId, ref: 'UserForm' },
    formatCriteria: { type: mongoose.Schema.Types.ObjectId, ref: 'FormatCriteria' },
    // status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status' },
    data: [
        [{ fieldText: String, fieldInput: String, dataType: String, note: String }]
    ], // id: data type id, name: name of field, dataType: type of data to be stored
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

UserCriteriaSchema.methods.edit = function(params, cb) {
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.owner = params.owner || this.owner;
    this.userForm = params.userForm || this.userForm;
    this.formatCriteria = params.formatCriteria || this.formatCriteria;
    // this.status = params.status || this.status;
    this.data = params.data || this.data;
    this.dateModified = new Date();
    this.save(cb);
};

mongoose.model('UserCriteria', UserCriteriaSchema);