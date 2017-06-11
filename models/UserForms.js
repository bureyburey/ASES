var mongoose = require('mongoose');
require('mongoose-double')(mongoose); // require Double data type


var UserFormSchema = new mongoose.Schema({
    name: String,
    slug: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formatForm: { type: mongoose.Schema.Types.ObjectId, ref: 'FormatForm' },
    userCriterias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserCriteria' }],

    // status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status' },
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

UserFormSchema.methods.edit = function(params, cb) {
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.owner = params.owner || this.owner;
    this.formatForm = params.formatForm || this.formatForm;
    this.userCriterias = params.userCriterias || this.userCriterias;
    // this.status = params.status || this.status;
    this.dateModified = new Date();
    this.save(cb);
};

mongoose.model('UserForm', UserFormSchema);