/**
 * FormatCriteria model
 * defines a dynamic criteria structure:
 * 
 * weight - the weight of criteria on evaluation
 * section - references to the section for which the criteria belongs to
 * fields - the field names and types of the criteria 
 */

var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin
require('mongoose-double')(mongoose); // require Double data type

var FormatCriteriaSchema = new mongoose.Schema({
    num: { type: Number, default: 1 },
    name: String,
    slug: String,
    weight: { type: mongoose.Schema.Types.Double, default: 1 },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    fields: [{ id: Number, name: String, dataType: String }], // id: data type id, name: name of field, dataType: type of data to be stored
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

FormatCriteriaSchema.methods.edit = function(params, cb) {
    this.num = params.num || this.num;
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.weight = params.weight || this.weight;
    this.section = params.section || this.section;
    this.fields = params.fields || this.fields;
    this.dateModified = new Date();
    this.save(cb);
};

// apply auto increment on field 'num' with reference to 'section' field
FormatCriteriaSchema.plugin(AutoIncrement, { id: 'format_criteria_seq', inc_field: 'num', reference_fields: ['section'] });

mongoose.model('FormatCriteria', FormatCriteriaSchema);