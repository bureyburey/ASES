var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin
require('mongoose-double')(mongoose); // require Double data type
// IMPLEMENT AUTO-INCREMENT FOR FIELD num

var FormatCriteriaSchema = new mongoose.Schema({
    num: { type: Number, default: 1 },
    name: String,
    slug: String,
    weight: { type: mongoose.Schema.Types.Double, default: 1 },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    fields: [{ name: String, dataType: String }],
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

FormatCriteriaSchema.methods.edit = function (params, cb) {
    this.num = params.nam || this.num;
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.weight = params.weight || this.weight;
    this.section = params.section || this.section;
    this.dateModified = new Date();
    this.save(cb);
};

// unsure if this will work
FormatCriteriaSchema.plugin(AutoIncrement, { id: 'format_criteria_seq', inc_field: 'num', reference_fields: ['section'] });

mongoose.model('FormatCriteria', FormatCriteriaSchema);