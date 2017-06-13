/**
 * StaffGroup model
 * define a dynamic staff group:
 * 
 * group - the group number
 * name - the group name
 * 
 * currently existing group names:
 * בעלי תפקיד מנהלי בנוסף להשתייכות לסגל המחקרי/הוראתי
 * חברי סגל מחקרי
 * חברי סגל הוראה
 */

var mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence'); // require auto-increment plugin

var StaffGroupSchema = new mongoose.Schema({
    group: { type: Number, default: 1, unique: true },
    name: String,
    slug: String,
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

StaffGroupSchema.methods.edit = function(params, cb) {
    // this: StaffGroup object in database
    // params: edited object to be saved
    this.group = params.group || this.group;
    this.name = params.name || this.name;
    this.slug = params.slug;
    this.dateModified = new Date();
    this.save(cb);
};

// apply auto increment on field 'group'
StaffGroupSchema.plugin(AutoIncrement, { id: 'staff_group_seq', inc_field: 'group' });

mongoose.model('StaffGroup', StaffGroupSchema);