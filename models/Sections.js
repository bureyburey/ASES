var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin
// IMPLEMENT AUTO-INCREMENT FOR FIELD num

var SectionSchema = new mongoose.Schema({
    num: { type: Number, default: 1 },
    name: String,
    slug: String,
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

SectionSchema.methods.edit = function (params, cb) {
    this.num = params.num || this.num;
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.dateModified = new Date();
    this.save(cb);
};

SectionSchema.plugin(AutoIncrement, {inc_field: 'num'});

mongoose.model('Section', SectionSchema);