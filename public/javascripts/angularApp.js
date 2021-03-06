/**
 * main app variable
 * in the square brackets [] of the first line we inject services that will be used in the app
 * ui.router - page routing
 * ngCsvImport - convert .csv file into JSON
 * ngCsv - convert JSON into .csv file
 * ngSanitize - required for ngCsv
 * ngMaterial - Angular Material https://material.angularjs.org/latest/
 * toastr - toaster notifications
 * ngAnimate - required for toastr
 */
var app = angular.module('ases', ['ui.router', 'ngCsvImport', 'ngCsv', 'ngSanitize', 'ngMaterial', 'toastr', 'ngAnimate']);

/**
 * app.config holds various application configurations
 * the routing configuration is the only one currently needed
 * each state corresponds to a template in the index.ejs view:
 * for example: .state('form_fill', {.....})
 * <script type="text/ng-template" id="/form_fill.html">
 */

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
            })
            .state('admin_menu', {
                url: '/admin_menu',
                templateUrl: '/admin_menu.html',
                controller: 'AdminCtrl'
            })
            .state('message_board', {
                url: '/message_board',
                templateUrl: '/message_board.html',
                controller: 'MsgBoardCtrl',
                resolve: {
                    // make sure to load posts on startup
                    postPromise: ['posts', function(posts) {
                        return posts.getAll();
                    }]
                }
            })
            .state('staff_groups', {
                url: '/staff_groups',
                templateUrl: '/staff_groups.html',
                controller: 'StaffGroupsCtrl',
                resolve: {
                    // make sure to sections posts on startup
                    staffGroupsPromise: ['staffGroups', function(staffGroups) {
                        return staffGroups.getAll();
                    }]
                }
            })
            .state('sections', {
                url: '/sections',
                templateUrl: '/sections.html',
                controller: 'SectionsCtrl',
                resolve: {
                    // make sure to load staff groups and sections on startup
                    staffGroupsPromise: ['staffGroups', function(staffGroups) {
                        return staffGroups.getAll();
                    }],
                    sectionsPromise: ['sections', function(sections) {
                        return sections.getAll();
                    }]
                }
            })
            .state('format_criterias', {
                url: '/format_criterias',
                templateUrl: '/format_criterias.html',
                controller: 'FormatCriteriaCtrl',
                resolve: {
                    // make sure to load sections on startup
                    sectionsPromise: ['sections', function(sections) {
                        return sections.getAll();
                    }],
                    // make sure to load criteria formats on startup
                    formatCriteriasPromise: ['formatCriterias', function(formatCriterias) {
                        return formatCriterias.getAll();
                    }]
                }
            })
            .state('format_forms', {
                url: '/format_forms',
                templateUrl: '/format_forms.html',
                controller: 'FormatFormCtrl',
                resolve: {
                    sectionsPromise: ['sections', function(sections) {
                        return sections.getAll();
                    }],
                    // make sure to load criterias formats on startup
                    formatCriteriasPromise: ['formatCriterias', function(formatCriterias) {
                        return formatCriterias.getAll();
                    }],
                    // make sure to load format forms on startup
                    formatFormsPromise: ['formatForms', function(formatForms) {
                        return formatForms.getAll();
                    }]
                }
            })
            .state('form_select', {
                url: '/form_select',
                templateUrl: '/form_select.html',
                controller: 'FormSelectCtrl',
                resolve: {
                    // make sure to load format forms on startup
                    formatFormsPromise: ['formatForms', function(formatForms) {
                        return formatForms.getAll();
                    }],
                    userFormsPromise: ['userForms', function(userForms) {
                        return userForms.getAllPost();
                    }],
                    usersPromise: ['users', function(users) {
                        return users.getAllPost();
                        // return users.getAll();
                    }]
                }
            })
            .state('form_fill', {
                url: '/form_fill/{currentUser}/{id}',
                templateUrl: '/form_fill.html',
                controller: 'FormFillCtrl',
                resolve: {
                    // formatForm: ['$stateParams', 'formatForms', function($stateParams, formatForms) {
                    //     return formatForms.get($stateParams.id);
                    // }],
                    sectionsPromise: ['sections', function(sections) {
                        return sections.getAll();
                    }],
                    userForm: ['$stateParams', 'userForms', function($stateParams, userForms) {
                        return userForms.get($stateParams.id);
                    }]
                }
            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });

        $urlRouterProvider.otherwise('home');
    }
]);


// SERVICE FACTORIES START
/**
 * each factory is essentially a service to that communicate with between the client and the API server
 * each factory store an obj variable with an array of the object the factory provides
 * and methods to communicate with the API using $http service
 */
app.factory('users', ['$http', 'auth', function($http, auth) {
    var obj = {
        users: []
    };
    obj.getAll = function() {
        // please use post('/userspost') instead
        return $http.get('/users').success(function(data) {
            angular.copy(data, obj.users);
        });
    };
    obj.getAllPost = function() {
        // get all users from the server if permission is sufficent
        return $http.post('/userspost', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            angular.copy(data, obj.users);
        });
    };
    obj.create = function(user) {
        // create a new section and upload to server
        return $http.post('/users', user, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.users.push(data);
        });
    };
    obj.get = function(id) {
        // get a user from the server
        return $http.get('/users/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(user, userEdit) {
        return $http.put('/users/' + user._id + '/edit', userEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.users[obj.users.indexOf(user)] = data;
        });
    };
    obj.delete = function(user) {
        return $http.put('/users/' + user._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.users.splice(obj.users.indexOf(user), 1);
        });
    };
    return obj;
}]);

app.factory('staffGroups', ['$http', 'auth', function($http, auth) {
    var obj = {
        staffGroups: []
    };
    obj.getAll = function() {
        // get all sections from server and deep copy the data
        return $http.get('/staffgroups').success(function(data) {
            angular.copy(data, obj.staffGroups);
        });
    };
    obj.create = function(staffGroup) {
        // create a new section and upload to server
        return $http.post('/staffgroups', staffGroup, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.staffGroups.push(data);
        });
    };
    obj.get = function(id) {
        // get a section from the server
        return $http.get('/staffgroups/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(staffGroup, staffGroupEdit) {
        return $http.put('/staffgroups/' + staffGroup._id + '/edit', staffGroupEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.staffGroups[obj.staffGroups.indexOf(staffGroup)] = data;
        });
    };
    obj.delete = function(staffGroup) {

        return $http.put('/staffgroups/' + staffGroup._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.staffGroups.splice(obj.staffGroups.indexOf(staffGroup), 1);
        });
    };
    return obj;
}]);

app.factory('sections', ['$http', 'auth', function($http, auth) {
    var obj = {
        sections: []
    };
    obj.getAll = function() {
        // get all sections from server and deep copy the data
        return $http.get('/sections').success(function(data) {
            angular.copy(data, obj.sections);
        });
    };
    obj.create = function(section) {
        // create a new section and upload to server
        return $http.post('/sections', section, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.sections.push(data);
        });
    };
    obj.get = function(id) {
        // get a section from the server
        return $http.get('/sections/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(section, sectionEdit) {
        return $http.put('/sections/' + section._id + '/edit', sectionEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.sections[obj.sections.indexOf(section)] = data;
        });
    };
    obj.delete = function(section) {

        return $http.put('/sections/' + section._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.sections.splice(obj.sections.indexOf(section), 1);
        });
    };
    return obj;
}]);

app.factory('formatCriterias', ['$http', 'auth', function($http, auth) {
    var obj = {
        formatCriterias: []
    };
    // ALL METHODS NEED TO BE IMPLEMENTED IN ROUTES!!!!
    obj.getAll = function() {
        // get all format criterias from server and deep copy the data
        return $http.get('/formatcriterias').success(function(data) {
            angular.copy(data, obj.formatCriterias);
        });
    };
    obj.create = function(formatCriteria) {
        // create a new format criteria and upload to server
        return $http.post('/formatcriterias', formatCriteria, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatCriterias.push(data);
        });
    };
    obj.get = function(id) {
        // get a format criterias from the server
        return $http.get('/formatcriterias/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(formatCriteria, formatCriteriaEdit) {
        return $http.put('/formatcriterias/' + formatCriteria._id + '/edit', formatCriteriaEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatCriterias[obj.formatCriterias.indexOf(formatCriteria)] = data;
        });
    };
    obj.delete = function(formatCriteria) {
        return $http.put('/formatcriterias/' + formatCriteria._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatCriterias.splice(obj.formatCriterias.indexOf(formatCriteria), 1);
        });
    };
    return obj;
}]);

app.factory('formatForms', ['$http', 'auth', function($http, auth) {
    var obj = {
        formatForms: []
    };
    obj.getAll = function() {
        // get all format forms from server and deep copy the data
        return $http.get('/formatforms').success(function(data) {
            angular.copy(data, obj.formatForms);
        });
    };
    obj.create = function(formatForm) {
        // create a new format form and upload to server
        return $http.post('/formatforms', formatForm, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatForms.push(data);
        });
    };
    obj.get = function(id) {
        // get a format form from the server
        return $http.get('/formatforms/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(formatForm, formatFormEdit) {
        return $http.put('/formatforms/' + formatForm._id + '/edit', formatFormEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatForms[obj.formatForms.indexOf(formatForm)] = data;
        });
    };
    obj.delete = function(formatForm) {
        return $http.put('/formatforms/' + formatForm._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatForms.splice(obj.formatForms.indexOf(formatForm), 1);
        });
    };
    return obj;
}]);

app.factory('userCriterias', ['$http', 'auth', function($http, auth) {
    var obj = {
        userCriterias: []
    };
    obj.getAll = function() {
        // get all user criterias from server and deep copy the data
        return $http.get('/usercriterias').success(function(data) {
            angular.copy(data, obj.userCriterias);
        });
    };

    obj.save = function(userCriterias) {
        return $http.post('/usercriterias/save', userCriterias, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            // obj.userCriterias.push(data);
            angular.copy(data, obj.userCriterias);
        });
    };

    obj.create = function(userCriterias) {
        // create a new user criteria and upload to server
        return $http.post('/usercriterias', userCriterias, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userCriterias.push(data);
        });
    };
    obj.get = function(id) {
        // get a user criterias from the server
        return $http.get('/usercriterias/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(userCriteria, userCriteriaEdit) {
        return $http.put('/usercriterias/' + userCriteria._id + '/edit', userCriteriaEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userCriterias[obj.userCriterias.indexOf(userCriteria)] = data;
        });
    };
    obj.delete = function(userCriteria) {
        return $http.put('/usercriterias/' + userCriteria._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userCriterias.splice(obj.userCriterias.indexOf(userCriteria), 1);
        });
    };
    return obj;
}]);

app.factory('userForms', ['$http', 'auth', function($http, auth) {
    var obj = {
        userForms: []
    };
    obj.getAll = function() {
        // get all user forms from server and deep copy the data
        return $http.get('/userforms').success(function(data) {
            angular.copy(data, obj.userForms);
        });
    };

    obj.getAllPost = function() {
        // get all user forms of a specific user
        return $http.post('/userformspost', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            angular.copy(data, obj.userForms);
        });
    };

    obj.create = function(formatForm) {
        // create a new user form and upload to server
        return $http.post('/userforms', formatForm, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userForms.push(data);
        });
    };
    obj.get = function(id) {
        // get a user form from the server
        return $http.get('/userforms/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.update = function(userForm, userFormEdit) {
        return $http.put('/userforms/' + userForm._id + '/edit', userFormEdit, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userForms[obj.userForms.indexOf(userForm)] = data;
        });
    };
    obj.delete = function(userForm) {
        return $http.put('/userform/' + userForm._id + '/delete', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.userForms.splice(obj.userForms.indexOf(userForm), 1);
        });
    };
    return obj;
}]);

app.factory('posts', ['$http', 'auth', function($http, auth) {
    var obj = {
        posts: []
    };

    obj.getAll = function() {
        // get all posts from server and deep copy the data
        return $http.get('/posts').success(function(data) {
            angular.copy(data, obj.posts);
        });
    };
    obj.create = function(post) {
        return $http.post('/posts', post, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.posts.push(data);
        });
    };
    obj.upvote = function(post) {
        return $http.put('/posts/' + post._id + '/upvote', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            post.upvotes += 1;
        });
    };
    obj.get = function(id) {
        return $http.get('/posts/' + id).then(function(res) {
            return res.data;
        });
    };
    obj.addComment = function(id, comment) {
        return $http.post('/posts/' + id + '/comments', comment, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        });
    };
    obj.upvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            comment.upvotes += 1;
        });
    };
    return obj;
}]);

app.factory('auth', ['$http', '$window', function($http, $window) {
    var auth = {};
    auth.saveToken = function(token) {
        $window.localStorage['ases-token'] = token;
    };

    auth.getToken = function() {
        return $window.localStorage['ases-token'];
    }
    auth.isLoggedIn = function() {
        var token = auth.getToken();
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };
    auth.userId = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload._id;
        }
    };
    auth.register = function(user) {
        return $http.post('/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    auth.registerFromCSV = function(user) {
        return $http.post('/register', user).success(function(data) {});
    };
    auth.logIn = function(user) {
        return $http.post('/login', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function() {
        $window.localStorage.removeItem('ases-token');
    };
    return auth;
}]);
// SERVICE FACTORIES END



// APP CONTROLLERS START
/**
 * each controller is controls a template in the index.ejs page.
 * the controller deleration is made in the route configuration app.config(....)
 * in the 'controller' field of each of the states
 */
app.controller('AdminCtrl', [
    '$scope',
    '$parse',
    'auth',
    function($scope, $parse, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.primitives = {};
        $scope.exportToCSV = [];
        $scope.csvHeader = ['username', 'password'];

        $scope.generatePassword = function() {
            // generates random 8 characters password
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }

        $scope.registerFromCSV = function(user) {
            // register user from CSV file
            if ($scope.exportToCSV.findIndex(function(el) { return el.username === user.username }) > -1) { return; }
            user.password = $scope.generatePassword(); // generate random password
            // call factory service which registers the user
            auth.registerFromCSV(user).success(function() {
                // add the newly added user to an array which will be exported back to csv with password
                $scope.exportToCSV.push(user);
                user.status = 0; // no error
            }).error(function(error) {
                $scope.error = error;
                user.status = 1; // error occured
                return;
            }).then(function() {
                $state.go('home');
            });
        };

        $scope.registerSelectedFromCSV = function() {
            // register users list one by one
            for (var i = 0; i < $scope.csv.result.length; i++) {
                var user = $scope.csv.result[i];
                if (user.selected) { $scope.registerFromCSV(user); }
            }
        }

        $scope.checkOne = function(user) {
            if (!user.selected) {
                $scope.primitives.selectedAll = false;
            }
        }

        $scope.checkAll = function() {
            // select all users
            if ($scope.primitives.selectedAll) {
                $scope.primitives.selectedAll = true;
            } else {
                $scope.primitives.selectedAll = false;
            }
            angular.forEach($scope.csv.result, function(user) {
                user.selected = $scope.primitives.selectedAll;
            });
        };

        // cvs extraction variables/methods
        $scope.Math = window.Math;
        $scope.csv = {
            content: null,
            header: true,
            headerVisible: true,
            separator: ',',
            separatorVisible: true,
            result: null,
            encoding: 'ISO-8859-1',
            encodingVisible: true,
            uploadButtonLabel: "upload a csv file",
            progressCallback: function(progress) {
                $scope.$apply(function() {
                    $scope.progress = progress;
                });
            },
            streamingCallback: function(stream) {
                if (typeof stream != "undefined") {
                    $scope.$apply(function() {
                        $scope.preview = stream[Math.floor(Math.random() * stream.length)];
                    });
                }
            },
            streamingErrorCallback: function(streamError) {
                console.log(streamError);
            }
        };
        var _lastGoodResult = '';
        $scope.toPrettyJSON = function(json, tabWidth) {
            var objStr = JSON.stringify(json);
            var obj = null;
            try {
                obj = $parse(objStr)({});
            } catch (e) {
                // eat $parse error
                return _lastGoodResult;
            }
            var result = JSON.stringify(obj, null, Number(tabWidth));
            _lastGoodResult = result;
            return result;
        };
    }
]);

app.controller('StaffGroupsCtrl', [
    '$scope',
    'staffGroups',
    'toastr',
    'auth',
    '$mdDialog',
    function($scope, staffGroups, toastr, auth, $mdDialog) {
        $scope.staffGroups = staffGroups.staffGroups;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addStaffGroup = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }
            staffGroups.create({
                group: $scope.group,
                name: $scope.name,
                slug: $scope.slug
            }).error(function() {
                // do nothing
            }).success(function() {
                toastr.success($scope.name, "קבוצת סגל התווספה!");
            });;
            $scope.group = '';
            $scope.name = '';
            $scope.slug = '';
        };

        $scope.editStaffGroup = function(index, staffGroup) {
            if (staffGroup.name === '' || staffGroup.name.length === 0) { return; }
            if (!confirm("החל שינויים?")) { return; }
            staffGroups.update(staffGroup, {
                _id: staffGroup._id,
                group: staffGroup.group,
                name: staffGroup.name,
                slug: staffGroup.slug,
                dateCreated: staffGroup.dateCreated,
                dateModified: new Date()
            });

            // alternative implementation with ngMaterial confirm dialog
            // var confirmDialog = $mdDialog.confirm()
            //     .title("החל שינויים?")
            //     .ok('בצע')
            //     .cancel('בטל');
            // $mdDialog.show(confirmDialog).then(function() {
            //     staffGroups.update(staffGroup, {
            //         _id: staffGroup._id,
            //         group: staffGroup.group,
            //         name: staffGroup.name,
            //         slug: staffGroup.slug,
            //         dateCreated: staffGroup.dateCreated,
            //         dateModified: new Date()
            //     });
            // }, function() {
            //    // do nothing
            // });
        }

        $scope.deleteStaffGroup = function(staffGroup) {
            if (!confirm("מחק קבוצה?")) { return; }
            staffGroups.delete(staffGroup);
        }
    }
]);

app.controller('SectionsCtrl', [
    '$scope',
    'staffGroups',
    'sections',
    'toastr',
    'auth',
    function($scope, staffGroups, sections, toastr, auth) {
        $scope.staffGroups = staffGroups.staffGroups;
        $scope.sections = sections.sections;
        $scope.isLoggedIn = auth.isLoggedIn;

        // for dynamic selection of staff groups
        $scope.checkedStaffGroups = [];

        $scope.toggleCheck = function(staffGroup, staffGroupsUser) {
            // assign the checked groups array to the argument array or the global checked groups (prioritize argument array)
            arrRefrence = staffGroupsUser || $scope.checkedStaffGroups;
            staffGroupIndex = $scope.staffGroupIndex(staffGroup, arrRefrence);
            if (staffGroupIndex === -1) {
                // group was not found --> add it to the list
                arrRefrence.push(staffGroup);
            } else {
                // remove the group from the checked array
                arrRefrence.splice(staffGroupIndex, 1);
            }
        };

        $scope.staffGroupIndex = function(staffGroup, staffGroupsUser) {
            // returns index of staffGroup in staffGroupsUser list, -1 if not exists
            return staffGroupsUser.findIndex(function(staffGroupUser) {
                return staffGroup._id === staffGroupUser._id;
            });
        }

        $scope.buildStaffGroupsList = function(groupsList) {
            selectedStaffGroups = [];
            for (i = 0; i < groupsList.length; i++) {
                selectedStaffGroups.push(groupsList[i]._id);
            }
            return selectedStaffGroups;
        }

        $scope.addSection = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }

            // build IDs of selected sections
            sections.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                staffGroups: $scope.buildStaffGroupsList($scope.checkedStaffGroups)
            }).error(function() {
                // do nothing
            }).success(function() {
                toastr.success($scope.name, "תחום פעילות התווסף!");
            });;
            $scope.num = '';
            $scope.name = '';
            $scope.slug = '';
            $scope.checkedStaffGroups = [];
        };

        $scope.editSection = function(index, section) {
            if (section.name === '' || section.name.length === 0) { return; }
            if (!confirm("החל שינויים?")) { return; }
            sections.update(section, {
                _id: section._id,
                num: section.num,
                name: section.name,
                slug: section.slug,
                staffGroups: $scope.buildStaffGroupsList(section.staffGroups),
                dateCreated: section.dateCreated,
                dateModified: new Date()
            });
        }

        $scope.deleteSection = function(section) {
            if (!confirm("מחק פעילות?")) { return; }
            sections.delete(section);
        }
    }
]);

app.controller('FormatCriteriaCtrl', [
    '$scope',
    'sections',
    'formatCriterias',
    'toastr',
    'auth',
    function($scope, sections, formatCriterias, toastr, auth) {
        $scope.formatCriterias = formatCriterias.formatCriterias;
        $scope.sections = sections.sections;
        $scope.isLoggedIn = auth.isLoggedIn;

        // dynamic adding of fields
        // mapping of available pre-defined field names and their data types
        $scope.dataTypes = [
            { id: 1, placeholder: "טקסט", dataType: "String" },
            { id: 2, placeholder: "קישור אינטרנטי", dataType: "Link" },
            { id: 3, placeholder: "מספר", dataType: "Number" },
            { id: 4, placeholder: "תאריך", dataType: "Date" }
        ];

        $scope.toggle = function(element) {
            if (element.toggle === undefined) { element.toggle = false; }
            element.toggle = !element.toggle;
        }

        $scope.fields = [];

        $scope.addNewField = function(fieldsUser) {
            var arrRefrence = fieldsUser || $scope.fields;
            arrRefrence.push({
                id: 0,
                name: "",
                dataType: ""
            });
        };

        $scope.removeField = function(i, fieldsUser) {
            var arrRefrence = fieldsUser || $scope.fields;
            arrRefrence.splice(i, 1);
        };

        $scope.buildFieldsData = function(fieldsDataList) {
            var fieldsData = [];
            for (i = 0; i < fieldsDataList.length; i++) {
                fieldsData.push({
                    id: fieldsDataList[i].dataType.id || fieldsDataList[i].id,
                    name: fieldsDataList[i].name,
                    dataType: fieldsDataList[i].dataType.dataType || fieldsDataList[i].dataType
                });
                if (fieldsData[i].dataType === undefined ||
                    fieldsData[i].dataType === null ||
                    fieldsData[i].dataType.length === 0) { return -1; }
            }
            return fieldsData;
        }

        $scope.getSectionIndexByNum = function(num) {
            return $scope.sections.findIndex(function(section) {
                return section.num === num;
            });
        }

        $scope.addFormatCriteria = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }
            if ($scope.section === undefined || $scope.section === null) {
                toastr.error('נא לבחור תחום פעילות!', 'שגיאת מילוי!');
                return;
            }
            var fields = $scope.buildFieldsData($scope.fields);
            if (fields === -1) {
                toastr.error('נא לבחור סוג שדה!', 'שגיאת מילוי!');
                return;
            }
            formatCriterias.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                weight: $scope.weight,
                section: $scope.section,
                fields: fields
            }).error(function() {
                // do nothing
            }).success(function() {
                toastr.success($scope.name, "קריטריון הערכה התווסף!");
            });
            // $scope.num = '';
            // $scope.name = '';
            // $scope.slug = '';
        };

        $scope.editFormatCriteria = function(index, formatCriteria) {
            var fields = $scope.buildFieldsData(formatCriteria.fields);
            if (fields === -1) {
                toastr.error('נא לבחור סוג שדה!', 'שגיאת מילוי!');
                return;
            }
            if (!confirm("החל שינויים?")) { return; }
            formatCriterias.update(formatCriteria, {
                _id: formatCriteria._id,
                num: formatCriteria.num,
                name: formatCriteria.name,
                slug: formatCriteria.slug,
                weight: formatCriteria.weight,
                section: formatCriteria.section,
                fields: fields,
                dateModified: new Date()
            });
        }
        $scope.deleteFormatCriteria = function(formatCriteria) {
            if (!confirm("מחק קריטריון הערכה?")) { return; }
            formatCriterias.delete(formatCriteria);
        }
    }
]);

app.controller('FormatFormCtrl', [
    '$scope',
    'sections',
    'formatCriterias',
    'formatForms',
    'toastr',
    'auth',
    function($scope, sections, formatCriterias, formatForms, toastr, auth) {
        $scope.sections = sections.sections;
        $scope.formatCriterias = formatCriterias.formatCriterias;
        $scope.formatForms = formatForms.formatForms;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.checkedFormatCriterias = [];

        $scope.toggleCheck = function(formatCriteria, formatCriteriaUser) {
            // assign the checked groups array to the argument array or the global checked groups (prioritize argument array)
            var arrRefrence = formatCriteriaUser || $scope.checkedFormatCriterias;
            var formatCriteriaIndex = $scope.formatCriteriaIndex(formatCriteria, arrRefrence);
            if (formatCriteriaIndex === -1) {
                // group was not found --> add it to the list
                arrRefrence.push(formatCriteria);
            } else {
                // remove the group from the checked array
                arrRefrence.splice(formatCriteriaIndex, 1);
            }
        };
        $scope.formatCriteriaIndex = function(formatCriteria, formatCriteriasUser) {
            // returns index of criteriaFormat in formatCriteriasUser list, -1 if not exists
            return formatCriteriasUser.findIndex(function(formatCriteriaUser) {
                return formatCriteria._id === formatCriteriaUser._id;
            });
        }
        $scope.toggle = function(element) {
            if (element.toggle === undefined) { element.toggle = false; }
            element.toggle = !element.toggle;
        }
        $scope.sectionsUser = function(sectionUser) {
            sectionUser.sections = angular.copy($scope.sections);
            return sectionUser.sections;
        }
        $scope.buildFormatCriteriasData = function(criteriasDataList) {
            formatCriteriasData = [];
            for (i = 0; i < criteriasDataList.length; i++) {
                formatCriteriasData.push(criteriasDataList[i]._id);
            }
            // alert("Sending to server: \n" + JSON.stringify(formatCriteriasData, null, 2));
            return formatCriteriasData;
        }
        $scope.addFormatForm = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }
            formatForms.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                formatCriterias: $scope.buildFormatCriteriasData($scope.checkedFormatCriterias)
            }).error(function() {
                // do nothing
            }).success(function() {
                toastr.success($scope.name, "טופס הערכה התווסף!");
            });;
            $scope.name = '';
            $scope.slug = '';
        };
        $scope.editFormatForm = function(index, formatForm) {
            if (!confirm("החל שינויים?")) { return; }
            formatForms.update(formatForm, {
                _id: formatForm._id,
                num: formatForm.num,
                name: formatForm.name,
                slug: formatForm.slug,
                formatCriterias: $scope.buildFormatCriteriasData(formatForm.formatCriterias),
                dateModified: new Date()
            }).error(function() {
                // do nothing
            }).success(function() {
                toastr.success($scope.name, "טופס הערכה עודכן!");
            });;
        }
        $scope.deleteFormatForm = function(formatForm) {
            if (!confirm("מחק טופס?")) { return; }
            formatForms.delete(formatForm);
        }
    }
]);

app.controller('FormSelectCtrl', [
    '$scope',
    'users',
    'formatForms',
    'userForms',
    'toastr',
    'auth',
    function($scope, users, formatForms, userForms, toastr, auth) {
        $scope.users = users.users;
        $scope.formatForms = formatForms.formatForms;
        $scope.userForms = userForms.userForms;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;


        $scope.userHasForm = function(form, user) {
            var index = $scope.userForms.findIndex(function(userForm) {
                return userForm.owner === user._id && userForm.formatForm._id === form._id;
            });
            return index > -1;
        }

        $scope.addUserForm = function(form, user) {

            var index = $scope.userForms.findIndex(function(userForm) {
                return userForm.owner === user._id && userForm.formatForm._id === form._id;
            });
            if (index > -1) {
                toastr.error('טופס זה כבר הופץ למשתמש זה!', 'שגיאה בהפצת טופס!');
                return;
            }
            var data = {};
            data.name = "";
            data.slug = "";
            data.owner = user._id;
            data.formatForm = form._id;
            data.userCriterias = [];
            userForms.create(data).success(function() {
                toastr.success('טופס זה הופץ בהצלחה!', 'טופס הופץ!');
            });
        }

        $scope.getUsername = function(id) {
                if ($scope.currentUser() !== 'admin') { return $scope.currentUser(); }
                var index = $scope.users.findIndex(function(el) {
                    return el._id === id;
                });
                return $scope.users[index].username;
            }
            // alert(JSON.stringify($scope.userForms, null, 2));
    }
]);

app.controller('FormFillCtrl', [
    '$scope',
    'sections',
    'userForms',
    'userForm',
    'userCriterias',
    'toastr',
    'auth',
    function($scope, sections, userForms, userForm, userCriterias, toastr, auth) {
        $scope.sections = sections.sections;
        $scope.userForm = userForm;
        $scope.formatForm = userForm.formatForm;
        // $scope.userCriterias = userCriterias.userCriterias[0];
        $scope.userCriterias = userForm.userCriterias;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.userId = auth.userId;

        $scope.getApproved = function() {
            for (var i = 0; i < $scope.userCriterias.length; i++) {
                for (var j = 0; j < $scope.userCriterias[i].dataRows.length; j++) {
                    if ($scope.userCriterias[i].dataRows[j].rowValidated === false) { return false; }
                }
            }
            return $scope.userCriterias.length > 0;
        }

        $scope.addNewField = function(criteriaFields, formatCriteria) {
            // build data container for a single data row
            var data = {
                grade: -1,
                rowValidated: false,
                dataRow: null
            };
            // array for the elements of the data row
            var dataRow = [];
            // build empty row for criteria filling
            for (var i = 0; i < criteriaFields.length; i++) {
                var field = {
                    fieldText: criteriaFields[i].name,
                    fieldInput: "",
                    dataType: criteriaFields[i].dataType,
                    note: ""
                }
                dataRow.push(field);
            }
            data.dataRow = dataRow;
            var arrRefrence = $scope.userCriterias;
            // check if the criteria already been filled by the user (if so, only need to add row)
            var index = arrRefrence.findIndex(function(el) {
                return el.formatCriteria === formatCriteria._id;
            });
            if (index > -1) {
                // criteria been filled already, need to add row
                arrRefrence[index].dataRows.push(data);
            } else {
                // criteria is filled for the first time
                arrRefrence.push({
                    name: "",
                    slug: "",
                    owner: $scope.userId(),
                    userForm: $scope.userForm._id,
                    formatCriteria: formatCriteria._id,
                    // status: null,
                    dataRows: [data],
                    dateCreated: new Date(),
                    dateModified: new Date()
                });
            }
        };

        $scope.removeRow = function(dataRow, userCriteria) {
            var ind = userCriteria.indexOf(dataRow);
            userCriteria.splice(ind, 1);
            var count = 0;
            for (var i = $scope.userCriterias.length - 1; i >= 0; i--) {
                if ($scope.userCriterias[i].dataRows.length === 0) {
                    count++;
                    $scope.userCriterias[i].dataRows = [];
                }
            }
        }

        $scope.saveForm = function() {
            userCriterias.save($scope.userCriterias).then(function(data) {
                // all the user criteria ids of the form are inside data.data
                userForms.update(userForm, {
                    _id: userForm._id,
                    name: userForm.name,
                    slug: userForm.slug,
                    approved: userForm.approved,
                    owner: userForm.owner._id,
                    formatForm: userForm.formatForm._id,
                    userCriterias: data.data,
                    dateCreated: userForm.dateCreated,
                    dateModified: new Date()
                }).then(function() {
                    userForms.get($scope.userForm._id).then(function(userForm) {
                        $scope.userCriterias = userForm.userCriterias;
                        toastr.success("", "שינויים נשמרו!");
                        $scope.$apply(function() {});
                    });
                });
            });
        }
    }
]);

app.controller('MainCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
    }
]);

app.controller('MsgBoardCtrl', [
    '$scope',
    'posts',
    'auth',
    function($scope, posts, auth) {
        $scope.posts = posts.posts;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addPost = function() {
            if (!$scope.title || $scope.title === '') { return; }
            posts.create({
                author: auth.currentUser,
                title: $scope.title,
                link: $scope.link,
            });
            $scope.title = '';
            $scope.link = '';
        };

        $scope.incrementUpvotes = function(post) {
            posts.upvote(post);
        };
    }
]);

app.controller('PostsCtrl', [
    '$scope',
    'posts',
    'post',
    'auth',
    function($scope, posts, post, auth) {
        $scope.post = post;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addComment = function() {
            if ($scope.body === '') { return; }
            posts.addComment(post._id, {
                body: $scope.body,
                author: auth.currentUser,
            }).success(function(comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };
        $scope.incrementUpvotes = function(comment) {
            posts.upvoteComment(post, comment);
        };
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };

        $scope.logIn = function() {
            auth.logIn($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);
// APP CONTROLLERS END

app.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
    // date format for ngMaterial (requires moment.js which included in index.ejs view head)
    $mdDateLocaleProvider.formatDate = function(date) {
        return date ? moment(date).format('DD/MM/YYYY') : '';
    };
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
}]);