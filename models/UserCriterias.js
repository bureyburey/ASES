/**
 * UserCriteria model
 * define a dynamic user criteria filled by a user:
 * 
 * owner - reference to the owner of the filled criteria
 * userForm - reference to the form the filled criteria belongs to
 * formatCriteria - reference to the format of the criteria
 * dataRows - list of lists of filled data by the user (each inner lists defines a row in a filled criteria)
 * rowValidated - indicates whether the row of data is validated or not
 * dataRow inside dataRows - row of fields representing a user input in the criteria
 */

var mongoose = require('mongoose');
require('mongoose-double')(mongoose); // require Double data type

var UserCriteriaSchema = new mongoose.Schema({
    name: String,
    slug: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userForm: { type: mongoose.Schema.Types.ObjectId, ref: 'UserForm' },
    formatCriteria: { type: mongoose.Schema.Types.ObjectId, ref: 'FormatCriteria' },
    // status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status' },
    dataRows: [{
        rowValidated: { type: Boolean, default: false },
        dataRow: [{ fieldText: String, fieldInput: String, dataType: String, note: String }]
    }], // id: data type id, name: name of field, dataType: type of data to be stored
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
    this.dataRows = params.dataRows || this.dataRows;
    this.dateModified = new Date();
    this.save(cb);
};

mongoose.model('UserCriteria', UserCriteriaSchema);