var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin
require('mongoose-double')(mongoose); // require Double data type

// var FormatCriteriaSchema = require('mongoose').model('FormatCriteria').schema;


// IMPLEMENT AUTO-INCREMENT FOR FIELD num


var FormatFormSchema = new mongoose.Schema({
    num: { type: Number, default: 1 },
    name: String,
    slug: String,
    // formatCriterias: [FormatCriteriaSchema],
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

// unsure if this will work
FormatFormSchema.plugin(AutoIncrement, { id: 'format_form_seq', inc_field: 'num' });

mongoose.model('FormatForm', FormatFormSchema);