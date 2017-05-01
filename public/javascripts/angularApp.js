var app = angular.module('ases', ['ui.router']);

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
            .state('message_board', {
                url: '/message_board', // 
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
        // get all format criterias from server and deep copy the data
        return $http.get('/formatforms').success(function(data) {
            angular.copy(data, obj.formatForms);
        });
    };
    obj.create = function(formatForm) {
        // create a new format criteria and upload to server
        return $http.post('/formatforms', formatForm, {
            headers: { Authorization: 'Bearer ' + auth.getToken() }
        }).success(function(data) {
            obj.formatForms.push(data);
        });
    };
    obj.get = function(id) {
        // get a format criterias from the server
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
    auth.register = function(user) {
        return $http.post('/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
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
app.controller('StaffGroupsCtrl', [
    '$scope',
    'staffGroups',
    'auth',
    function($scope, staffGroups, auth) {
        $scope.staffGroups = staffGroups.staffGroups;
        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.addStaffGroup = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }
            staffGroups.create({
                group: $scope.group,
                name: $scope.name,
                slug: $scope.slug
            });
            $scope.group = '';
            $scope.name = '';
            $scope.slug = '';
        };

        $scope.editStaffGroup = function(index, staffGroup) {
            // alert(JSON.stringify(staffGroup));
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
    'auth',
    function($scope, staffGroups, sections, auth) {
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


            // $scope.checkedStaffGroups = staffGroupsUser || $scope.checkedStaffGroups;
            // // find the index of the staff group by its _id
            // staffGroupIndex = $scope.staffGroupIndex(staffGroup, $scope.checkedStaffGroups);
            // if (staffGroupIndex === -1) {
            //     // group was not found --> add it to the list
            //     $scope.checkedStaffGroups.push(staffGroup);
            // } else {
            //     // remove the group from the checked array
            //     $scope.checkedStaffGroups.splice(staffGroupIndex, 1);
            // }
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
            // alert(JSON.stringify($scope.checkedStaffGroups, null,2));
            if ($scope.name === '' || $scope.name.length === 0) { return; }

            // build IDs of selected sections
            sections.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                staffGroups: $scope.buildStaffGroupsList($scope.checkedStaffGroups)
            });
            $scope.num = '';
            $scope.name = '';
            $scope.slug = '';
            $scope.checkedStaffGroups = [];
        };

        $scope.editSection = function(index, section) {

            // alert(JSON.stringify(section.staffGroups,null,2));
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
    'auth',
    function($scope, sections, formatCriterias, auth) {
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

        $scope.fields = [];

        $scope.updateDataType = function(index, dataType, fieldsUser) {
            // arrRefrence = fieldsUser || $scope.fields;

            // alert(dataType);
            // alert(JSON.stringify(arrRefrence, null, 2));

            // arrRefrence[i].dataType = dataType;
        };

        $scope.addNewField = function(fieldsUser) {
            arrRefrence = fieldsUser || $scope.fields;
            arrRefrence.push({
                id: 0,
                name: "",
                dataType: ""
            });
        };

        $scope.removeField = function(i, fieldsUser) {
            arrRefrence = fieldsUser || $scope.fields;
            arrRefrence.splice(i, 1);
        };

        $scope.buildFieldsData = function(fieldsDataList) {
            fieldsData = [];
            for (i = 0; i < fieldsDataList.length; i++) {
                fieldsData.push({
                    id: fieldsDataList[i].dataType.id || fieldsDataList[i].id,
                    name: fieldsDataList[i].name,
                    // placeholder: fieldsDataList[i].dataType.placeholder || fieldsDataList[i].placeholder,
                    dataType: fieldsDataList[i].dataType.dataType || fieldsDataList[i].dataType
                });
            }
            alert("Sending to server: \n" + JSON.stringify(fieldsData, null, 2));
            return fieldsData;
        }


        $scope.getSectionIndexByNum = function(num) {
            return $scope.sections.findIndex(function(section) {
                return section.num === num;
            });
        }

        $scope.addFormatCriteria = function() {
            if ($scope.name === '' || $scope.name.length === 0) { return; }

            formatCriterias.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                weight: $scope.weight,
                section: $scope.section,
                fields: $scope.buildFieldsData($scope.fields)
            });
            // $scope.num = '';
            // $scope.name = '';
            // $scope.slug = '';
        };

        $scope.editFormatCriteria = function(index, formatCriteria) {
            alert(JSON.stringify(formatCriteria, null, 2));

            // if ($scope.formatCriteria[index].name === '' || $scope.formatCriteria[index].name.length === 0) { return; }
            if (!confirm("החל שינויים?")) { return; }
            formatCriterias.update(formatCriteria, {
                _id: formatCriteria._id,
                num: formatCriteria.num,
                name: formatCriteria.name,
                slug: formatCriteria.slug,
                weight: formatCriteria.weight,
                section: formatCriteria.section,
                fields: $scope.buildFieldsData(formatCriteria.fields),
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
    'auth',
    function($scope, sections, formatCriterias, formatForms, auth) {
        $scope.sections = sections.sections;
        $scope.formatCriterias = formatCriterias.formatCriterias;
        $scope.formatForms = formatForms.formatForms;
        $scope.isLoggedIn = auth.isLoggedIn;


        $scope.checkedFormatCriterias = [];

        $scope.toggleCheck = function(formatCriteria, formatCriteriaUser) {
            // assign the checked groups array to the argument array or the global checked groups (prioritize argument array)
            arrRefrence = formatCriteriaUser || $scope.checkedFormatCriterias;
            formatCriteriaIndex = $scope.formatCriteriaIndex(formatCriteria, arrRefrence);
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
            element.toggle = !element.toggle;
        }

        $scope.buildFormatCriteriasData = function(criteriasDataList) {
            formatCriteriasData = [];
            for (i = 0; i < criteriasDataList.length; i++) {
                formatCriteriasData.push(criteriasDataList[i]._id);
            }
            alert("Sending to server: \n" + JSON.stringify(formatCriteriasData, null, 2));
            return formatCriteriasData;
        }

        $scope.addFormatForm = function() {

            if ($scope.name === '' || $scope.name.length === 0) { return; }

            formatForms.create({
                num: $scope.num,
                name: $scope.name,
                slug: $scope.slug,
                formatCriterias: $scope.buildFormatCriteriasData($scope.checkedFormatCriterias)
            });
            // $scope.num = '';
            // $scope.name = '';
            // $scope.slug = '';
        };

        // REQUIRED IMPLEMENTETION FOR EDITING
        $scope.editFormatForm = function(index, formatForm) {
            alert(JSON.stringify(formatForm, null, 2));

            // if ($scope.formatCriteria[index].name === '' || $scope.formatCriteria[index].name.length === 0) { return; }
            if (!confirm("החל שינויים?")) { return; }
            formatForms.update(formatForm, {
                _id: formatForm._id,
                num: formatForm.num,
                name: formatForm.name,
                slug: formatForm.slug,
                formatCriterias: $scope.buildFormatCriteriasData(formatForm.formatCriterias),
                dateModified: new Date()
            });
        }

        $scope.deleteFormatForm = function(formatForm) {
            if (!confirm("מחק טופס?")) { return; }
            formatForms.delete(formatForm);
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