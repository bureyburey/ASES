var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });

// Schema models
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var Status = mongoose.model('Status');

var StaffGroup = mongoose.model('StaffGroup');
var Section = mongoose.model('Section');
var FormatCriteria = mongoose.model('FormatCriteria');
var FormatForm = mongoose.model('FormatForm');

var UserCriteria = mongoose.model('UserCriteria');
var UserForm = mongoose.model('UserForm');


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("INVOKED: router.get(home)");
    res.render('index', { title: 'Express' });
});

//////////////// POSTS+COMMENTS API START
// fetch all posts
// router.get('/posts', function (req, res, next) {
//   console.log("INVOKED: router.get(posts)");
//   Post.find(function (err, posts) {
//     if (err) { return next(err); }

//     res.json(posts);
//   });
// });

/* GET all posts from db INCLUDING comments */
router.get('/posts', function(req, res, next) {
    console.log("INVOKED: router.get(posts)");

    Post.find({}).populate('comments').exec(function(err, posts) {
        if (err) { return next(err); }

        res.json(posts);
    });
});
// add a new post
router.post('/posts', auth, function(req, res, next) {
    console.log("INVOKED: router.post(posts)");
    var post = new Post(req.body);
    post.author = req.payload.username;
    post.save(function(err, post) {
        if (err) { return next(err); }
        res.json(post);
    });
});
// preloading posts
router.param('post', function(req, res, next, id) {
    console.log("INVOKED: router.param(post)");
    var query = Post.findById(id);

    query.exec(function(err, post) {
        if (err) { return next(err); }
        if (!post) { return next(new Error('can\'t find post')); }

        req.post = post;
        return next();
    });
});
// preloading comment
router.param('comment', function(req, res, next, id) {
    console.log("INVOKED: router.param(comment)");
    var query = Comment.findById(id);
    query.exec(function(err, comment) {
        if (err) { return next(err); }
        if (!comment) { return next(new Error('can\'t find comment')); }
        req.comment = comment;
        return next();
    });
});
// upvote a post (refrenced to upvote method in Posts.js Schema)
router.put('/posts/:post/upvote', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/posts/" + req.post._id + "/upvote)");
    req.post.upvote(function(err, post) {
        if (err) { return next(err); }
        res.json(post);
    });
});
// add comment to a post
router.post('/posts/:post/comments', auth, function(req, res, next) {
    console.log("INVOKED: router.post(/posts/" + req.post._id + "/comments)");
    var comment = new Comment(req.body);
    comment.post = req.post;
    comment.author = req.payload.username;
    comment.save(function(err, comment) {
        if (err) { return next(err); }
        req.post.comments.push(comment);
        req.post.save(function(err, post) {
            if (err) { return next(err); }
            res.json(comment);
        });
    });
});
// upvote a comment in a post (refrenced to upvote method in Comments.js Schema)
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
    console.log("INVOKED: router.post(/posts/" + req.post._id + "/comments/" + req.comment._id + "/upvote)");
    req.comment.upvote(function(err, comment) {
        if (err) { return next(err); }
        res.json(comment);
    });
});
// get a post and all its comments
router.get('/posts/:post', function(req, res, next) {
    console.log("INVOKED: router.get(/posts/" + req.post._id + ")");
    req.post.populate('comments', function(err, post) {
        if (err) { return next(err); }
        res.json(post);
    });
});
//////////////// POSTS+COMMENTS API ENDS

//////////////// REGISTERATION+AUTHENTICATION API START
// register new user
router.post('/register', function(req, res, next) {
    console.log("INVOKED: router.post(register)");
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }
    var user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password)
    user.save(function(err) {
        if (err) { return next(err); }
        return res.json({ token: user.generateJWT() })
    });
});
// authenticate user
router.post('/login', function(req, res, next) {
    console.log("INVOKED: router.post(login)");
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }
    passport.authenticate('local', function(err, user, info) {
        console.log("INVOKED: passport.authenticate(local)");
        if (err) { return next(err); }
        if (user) {
            return res.json({ token: user.generateJWT() });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});
//////////////// REGISTERATION+AUTHENTICATION API ENDS


//////////////// USERS API START
// fetch all users
router.get('/users', function(req, res, next) {
    console.log("INVOKED: router.get(users)");
    User.find(function(err, user) {
        if (err) { return next(err); }
        res.json(user);
    });
});


router.post('/userspost', auth, function(req, res, next) {
    console.log("INVOKED: router.get(userspost)");

    if (req.payload.username === 'admin') {
        // change to permission check once implemented
        /*
        if (req.payload.permission === 'admin'){....}
        */
        User.find(function(err, user) {
            if (err) { return next(err); }
            res.json(user);
        });
    } else {
        res.json("UNAUTHENTICATED");
    }
});


// add a new staff groups
router.post('/users', auth, function(req, res, next) {
    console.log("INVOKED: router.post(users)");
    var user = new User(req.body);
    user.save(function(err, user) {
        if (err) { return next(err); }
        res.json(user);
    });
});
// preloading staff groups
router.param('user', function(req, res, next, id) {
    console.log("INVOKED: router.param(user)");
    var query = User.findById(id);

    query.exec(function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(new Error('can\'t find user')); }
        // save the found staff group to the request
        req.user = user;
        return next();
    });
});
// edit a staff group
router.put('/users/:user/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/users/" + req.user._id + "/edit)");
    console.log("request body: " + JSON.stringify(req.body));
    req.user.edit(req.body, function(err, user) {
        if (err) { return next(err); }
        res.json(user);
    });
});
// delete a staff group
router.put('/users/:user/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/users/" + req.user._id + "/delete)");
    req.user.remove(function(err) {
        if (err) { return next(err) };
        res.json("user deleted");
    });
});
//////////////// USERS API END



//////////////// STAFF GROUP API START
// fetch all staff groups
router.get('/staffgroups', function(req, res, next) {
    console.log("INVOKED: router.get(staffgroups)");
    StaffGroup.find(function(err, staffGroups) {
        if (err) { return next(err); }

        // console.log("Found "+staffGroups.length+" records");
        res.json(staffGroups);
    });
});
// add a new staff groups
router.post('/staffgroups', auth, function(req, res, next) {
    console.log("INVOKED: router.post(staffgroups)");
    var staffGroup = new StaffGroup(req.body);
    staffGroup.save(function(err, staffGroup) {
        if (err) { return next(err); }
        res.json(staffGroup);
    });
});
// preloading staff groups
router.param('staffgroup', function(req, res, next, id) {
    console.log("INVOKED: router.param(staffgroup)");
    var query = StaffGroup.findById(id);

    query.exec(function(err, staffGroup) {
        if (err) { return next(err); }
        if (!staffGroup) { return next(new Error('can\'t find staff group')); }
        // save the found staff group to the request
        req.staffGroup = staffGroup;
        return next();
    });
});
// edit a staff group
router.put('/staffgroups/:staffgroup/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/staffgroups/" + req.staffGroup._id + "/edit)");
    console.log("request body: " + JSON.stringify(req.body));
    req.staffGroup.edit(req.body, function(err, staffGroup) {
        if (err) { return next(err); }
        res.json(staffGroup);
    });
});
// delete a staff group
router.put('/staffgroups/:staffgroup/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/staffgroups/" + req.staffGroup._id + "/delete)");

    req.staffGroup.remove(function(err) {
        if (err) { return next(err) };
        res.json("staff group deleted");
    });
});
//////////////// STAFF GROUP API END


//////////////// SECTION API START
// fetch all sections
router.get('/sections', function(req, res, next) {
    console.log("INVOKED: router.get(sections)");

    Section.find({}).populate('staffGroups').exec(function(err, sections) {
        if (err) { return next(err); }

        res.json(sections);
    });

});
// add a new section
router.post('/sections', auth, function(req, res, next) {
    console.log("INVOKED: router.post(sections)");
    var section = new Section(req.body);
    console.log(req.body);
    section.save(function(err, section) {
        if (err) { return next(err); }

        // populate section before returning
        Section.populate(section, { path: "staffGroups" }, function(err, section) {
            if (err) { return next(err); }

            res.json(section);
        });
    });
});
// preloading section
router.param('section', function(req, res, next, id) {
    console.log("INVOKED: router.param(section)");
    var query = Section.findById(id);

    query.exec(function(err, section) {
        if (err) { return next(err); }
        if (!section) { return next(new Error('can\'t find section')); }
        // save the found section to the request
        req.section = section;
        return next();
    });
});
// edit a section
router.put('/sections/:section/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/sections/" + req.section._id + "/edit)");
    req.section.edit(req.body, function(err, section) {
        if (err) { return next(err); }
        // populate secion before returning
        Section.populate(section, { path: "staffGroups" }, function(err, section) {
            if (err) { return next(err); }

            res.json(section);
        });
    });
});
// delete a section
router.put('/sections/:section/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/sections/" + req.section._id + "/delete)");

    req.section.remove(function(err) {
        if (err) { return next(err) };
        res.json("section deleted");
    });

});
//////////////// SECTION API END



//////////////// FormatCriteria API START
// fetch all format criterias with sections refrences populated
router.get('/formatcriterias', function(req, res, next) {
    console.log("INVOKED: router.get(formatcriterias)");

    FormatCriteria.find({}).populate('section').exec(function(err, formatCriteria) {
        if (err) { return next(err); }

        res.json(formatCriteria);
    });
});

// fetch all format criterias (sections stays as refrences)
// router.get('/format_criterias', function (req, res, next) {
//   console.log("INVOKED: router.get(format_criterias)");
//   FormatCriteria.find(function (err, formatCriteria) {
//     if (err) { return next(err); }
//     res.json(formatCriteria);
//   });
// });

// add a new format criteria
router.post('/formatcriterias', auth, function(req, res, next) {
    console.log("INVOKED: router.post(formatcriterias)");
    // create new FormCriteria object
    var formatCriteria = new FormatCriteria(req.body);

    // save the newly created object to the database
    formatCriteria.save(function(err, formatCriteria) {
        if (err) { return next(err); }

        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        FormatCriteria.populate(formatCriteria, { path: "section" }, function(err, formatCriteria) {
            if (err) { return next(err); }

            res.json(formatCriteria);
        });
    });
});
// preloading format criteria
router.param('formatcriteria', function(req, res, next, id) {
    console.log("INVOKED: router.param(formatcriteria)");
    var query = FormatCriteria.findById(id);

    query.exec(function(err, formatCriteria) {
        if (err) { return next(err); }
        if (!formatCriteria) { return next(new Error('can\'t find formatcriteria')); }
        // save the found section to the request
        req.formatCriteria = formatCriteria;
        return next();
    });
});
// edit a format criteria
router.put('/formatcriterias/:formatcriteria/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/formatcriterias/" + req.formatCriteria._id + "/edit)");
    req.formatCriteria.edit(req.body, function(err, formatCriteria) {
        if (err) { return next(err); }
        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        FormatCriteria.populate(formatCriteria, { path: "section" }, function(err, formatCriteria) {
            if (err) { return next(err); }

            res.json(formatCriteria);
        });

        // res.json(formatCriteria);
    });
});
// delete a format criteria
router.put('/formatcriterias/:formatcriteria/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/formatcriterias/" + req.formatCriteria._id + "/delete)");
    console.log(JSON.stringify(req.formatCriteria));
    req.formatCriteria.remove(function(err) {
        if (err) { return next(err) };
        res.json("format criteria deleted");
    });

});
//////////////// FormatCriteria API END


//////////////// FormatForm API START
// fetch all format forms with format criteria refrences populated
router.get('/formatforms', function(req, res, next) {
    console.log("INVOKED: router.get(formatforms)");

    // deep populate format criteria and each format criteria section
    FormatForm.find({}).
    populate({ path: 'formatCriterias', populate: { path: 'section', model: 'Section' } }).
    exec(function(err, formatForms) {
        if (err) { return next(err); }
        res.json(formatForms);
    });
});

router.get('/formatforms/:formatform', function(req, res, next) {
    console.log("INVOKED: router.get(/formatforms/" + req.formatForm._id + ")");

    req.formatForm.populate('formatCriterias', function(err, formatForm) {
        if (err) { return next(err); }
        // console.log(formatForm)
        res.json(formatForm);
    });


    // req.formatForm.populate({ path: 'formatCriterias', populate: { path: 'section', model: 'Section' } }).
    // exec(function(err, formatForm) {

    //     if (err) { return next(err); }

    //     console.log(JSON.stringify(formatForm, null, 2));
    //     res.json(formatForm);
    // });

});
// add a new format form
router.post('/formatforms', auth, function(req, res, next) {
    console.log("INVOKED: router.post(formatforms)");
    // create new FormCriteria object
    console.log(JSON.stringify(req.body, null, 2));
    var formatForm = new FormatForm(req.body);

    // save the newly created object to the database
    formatForm.save(function(err, formatForm) {
        if (err) { return next(err); }

        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        FormatForm.populate(formatForm, { path: "formatCriterias" }, function(err, formatForm) {
            if (err) { return next(err); }

            res.json(formatForm);
        });
    });
});
// preloading format form
router.param('formatform', function(req, res, next, id) {
    console.log("INVOKED: router.param(formatform)");
    var query = FormatForm.findById(id);

    query.exec(function(err, formatForm) {
        if (err) { return next(err); }
        if (!formatForm) { return next(new Error('can\'t find formatform')); }
        // save the found section to the request
        req.formatForm = formatForm;
        return next();
    });
});
// edit a format form
router.put('/formatforms/:formatform/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/formatforms/" + req.formatForm._id + "/edit)");
    req.formatForm.edit(req.body, function(err, formatForm) {
        if (err) { return next(err); }
        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        FormatForm.populate(formatForm, { path: "formatCriterias" }, function(err, formatForm) {
            if (err) { return next(err); }

            res.json(formatForm);
        });
    });
});
// delete a format form
router.put('/formatforms/:formatform/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/formatforms/" + req.formatForm._id + "/delete)");
    console.log(JSON.stringify(req.formatForm));
    req.formatForm.remove(function(err) {
        if (err) { return next(err) };
        res.json("format form deleted");
    });

});
//////////////// FormatForm API END




//////////////// UserCriteria API START
// fetch all user criterias with sections refrences populated
// router.get('/usercriterias', function(req, res, next) {
//     console.log("INVOKED: router.get(usercriterias)");

//     FormatCriteria.find({}).populate('section').exec(function(err, formatCriteria) {
//         if (err) { return next(err); }

//         res.json(formatCriteria);
//     });
// });

// fetch all user criterias (sections stays as refrences)
router.get('/usercriterias', function(req, res, next) {
    console.log("INVOKED: router.get(usercriterias)");
    UserCriteria.find(function(err, userCriteria) {
        if (err) { return next(err); }
        res.json(userCriteria);
    });
});



// add/update multiple user criteria
router.post('/usercriterias/save', auth, function(req, res, next) {
    console.log("INVOKED: router.post(usercriterias/save)");
    UserCriteria.insertMany(req.body).then(function(data) {
        console.log(JSON.stringify(data, null, 2));
        res.json(data);
    });

    // for (var i = 0; i < req.body.length; i++) {
    //     console.log(JSON.stringify(req.body[i], null, 2));

    //     console.log("\n");
    // }
});


// add a new user criteria
router.post('/usercriterias', auth, function(req, res, next) {
    console.log("INVOKED: router.post(usercriterias)");
    // create new FormCriteria object
    var userCriteria = new UserCriteria(req.body);

    // save the newly created object to the database
    userCriteria.save(function(err, userCriteria) {
        if (err) { return next(err); }

        res.json(userCriteria);

        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        // UserCriteria.populate(userCriteria, { path: "section" }, function(err, userCriteria) {
        //     if (err) { return next(err); }

        //     res.json(userCriteria);
        // });
    });
});



router.post('/usercriteriasbyform', auth, function(req, res, next) {
    console.log("INVOKED: router.post(usercriteriasbyform)");


    console.log(req.headers.id);

    UserCriteria.find({ userForm: req.headers.id }).populate('formatForm').exec(function(err, userForm) {
        if (err) { return next(err); }
        console.log(JSON.stringify(userForm, null, 2));
        res.json(userForm);
    });


});


// preloading user criteria
router.param('usercriterias', function(req, res, next, id) {
    console.log("INVOKED: router.param(usercriterias)");
    var query = UserCriteria.findById(id);

    query.exec(function(err, userCriteria) {
        if (err) { return next(err); }
        if (!userCriteria) { return next(new Error('can\'t find usercriterias')); }
        // save the found section to the request
        req.userCriteria = userCriteria;
        return next();
    });
});
// edit a format criteria
router.put('/usercriterias/:usercriteria/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/usercriterias/" + req.userCriteria._id + "/edit)");
    req.userCriteria.edit(req.body, function(err, userCriteria) {
        if (err) { return next(err); }

        res.json(formatCriteria);

        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        // UserCriteria.populate(userCriteria, { path: "section" }, function(err, userCriteria) {
        //     if (err) { return next(err); }

        //     res.json(userCriteria);
        // });
    });
});
// delete a format criteria
router.put('/usercriterias/:usercriteria/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/usercriterias/" + req.userCriteria._id + "/delete)");
    console.log(JSON.stringify(req.userCriteria));
    req.userCriteria.remove(function(err) {
        if (err) { return next(err) };
        res.json("format criteria deleted");
    });

});
//////////////// UserCriteria API END


//////////////// UserForm API START
// fetch all user forms with format form refrences populated
router.get('/userforms', function(req, res, next) {
    console.log("INVOKED: router.get(userforms)");

    UserForm.find({}).populate('formatForm').exec(function(err, userForm) {
        if (err) { return next(err); }

        res.json(userForm);
    });



    // deep populate format criteria and each format criteria section
    // UserForm.find({}).
    // populate({ path: 'formatForm', populate: { path: 'section', model: 'Section' } }).
    // exec(function(err, formatForms) {
    //     if (err) { return next(err); }
    //     res.json(formatForms);
    // });
});


router.post('/userformspost', auth, function(req, res, next) {
    console.log("INVOKED: router.get(userformspost)");


    if (req.payload.username === 'admin') {
        // change to permission check once implemented
        /*
        if (req.payload.permission === 'admin'){....}
        */

        UserForm.find({}).populate('formatForm').exec(function(err, userForm) {
            if (err) { return next(err); }

            res.json(userForm);
        });




        // UserForm.find(function(err, userForm) {
        //     if (err) { return next(err); }
        //     res.json(userForm);
        // });
    } else {

        UserForm.find({ owner: req.payload._id }).populate('formatForm').exec(function(err, userForm) {
            if (err) { return next(err); }

            res.json(userForm);
        });



        // UserForm.find({ owner: req.payload._id }, function(err, userForm) {
        //     if (err) { return next(err); }
        //     res.json(userForm);
        // });
    }
});


router.get('/userforms/:userform', function(req, res, next) {
    console.log("INVOKED: router.get(/formatforms/" + req.userForm._id + ")");
    UserForm.populate(req.userForm, { path: "userCriterias" }, function(err, userForm) {
        if (err) { return next(err); }
        res.json(userForm);
    });
    // res.json(req.userForm);
});
// add a new user form
router.post('/userforms', auth, function(req, res, next) {
    console.log("INVOKED: router.post(userforms)");
    // create new user form object
    console.log(JSON.stringify(req.body, null, 2));
    var userForm = new UserForm(req.body);

    // save the newly created object to the database
    userForm.save(function(err, userForm) {
        if (err) { return next(err); }

        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        UserForm.populate(userForm, { path: "formatForm" }, function(err, userForm) {
            if (err) { return next(err); }
            res.json(userForm);
        });
    });
});
// preloading user form
router.param('userform', function(req, res, next, id) {
    console.log("INVOKED: router.param(userform)");
    var query = UserForm.findById(id);

    query.exec(function(err, userForm) {
        if (err) { return next(err); }
        if (!userForm) { return next(new Error('can\'t find user form')); }
        // save the found user form to the request
        UserForm.populate(userForm, {
            path: 'formatForm',
            populate: { path: 'formatCriterias', model: 'FormatCriteria' }
        }, function(err, userForm) {
            if (err) { return next(err); }

            req.userForm = userForm;
            return next();
        });
    });
});
// edit a user form
router.put('/userforms/:userform/edit', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/userforms/" + req.userForm._id + "/edit)");

    req.userForm.edit(req.body, function(err, userForm) {
        if (err) { return next(err); }
        // populate the section field of the returned saved object (needed as it is passed back to the client side)
        UserForm.populate(userForm, { path: "formatForm" }, function(err, userForm) {
            if (err) { return next(err); }

            res.json(userForm);
        });
    });
});
// delete a user form
router.put('/userforms/:userform/delete', auth, function(req, res, next) {
    console.log("INVOKED: router.put(/userforms/" + req.userForm._id + "/delete)");
    console.log(JSON.stringify(req.userForm));
    req.userForm.remove(function(err) {
        if (err) { return next(err) };
        res.json("user form deleted");
    });

});
//////////////// UserForm API END



//////////////// 2 API START

//////////////// 2 API END


module.exports = router;