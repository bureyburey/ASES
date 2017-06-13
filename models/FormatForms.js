/**
 * FormatForm model
 * define a dynamic form structure:
 * 
 * formatCriterias - list of references for format criterias which makes up the dynamic form
 */

var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin
require('mongoose-double')(mongoose); // require Double data type

var FormatFormSchema = new mongoose.Schema({
    num: { type: Number, default: 1 },
    name: String,
    slug: String,
    formatCriterias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FormatCriteria' }],
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

FormatFormSchema.methods.edit = function(params, cb) {
    this.num = params.num || this.num;
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.formatCriterias = params.formatCriterias || this.formatCriterias;
    this.dateModified = new Date();
    this.save(cb);
};

// apply auto increment on field 'num'
FormatFormSchema.plugin(AutoIncrement, { id: 'format_form_seq', inc_field: 'num' });

mongoose.model('FormatForm', FormatFormSchema);