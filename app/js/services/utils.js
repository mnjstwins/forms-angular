formsAngular.service('utils', function() {


    this.getAddAllGroupOptions = function(scope, attrs, classes) {
        return getAddAllOptions(scope, attrs, "Group", classes);
    };

    this.getAddAllFieldOptions = function(scope, attrs, classes) {
        return getAddAllOptions(scope, attrs, "Field", classes);
    };

    this.getAddAllLabelOptions = function(scope, attrs, classes) {
        return getAddAllOptions(scope, attrs, "Label", classes);
    };

    function getAddAllOptions(scope, attrs, type, classes) {

        var addAllOptions = [],
            classList = [],
            tmp, i, options;

        type = "addAll" + type;

        if (typeof(classes) === 'string') {
            tmp = classes.split(' ');
            for (i = 0; i < tmp.length; i++) {
                classList.push(tmp[i]);
            }
        }

        function getAllOptions(obj) {

            for (var key in obj) {
                if (key === type) {
                    addAllOptions.push(obj[key]);
                }

                if (key === "$parent") {
                    getAllOptions(obj[key]);
                }
            }
        }

        getAllOptions(scope);

        if (attrs[type] !== undefined) {

            if (typeof(attrs[type]) === "object") {

                //support objects...

            } else if (typeof(attrs[type]) === "string") {

                tmp = attrs[type].split(' ');

                for (i = 0; i < tmp.length; i++) {
                    if (tmp[i].indexOf('class=') === 0) {
                        classList.push(tmp[i].substring(6, tmp[i].length));
                    } else {
                        addAllOptions.push(tmp[i]);
                    }
                }
            } else {
                // return false; //error?
            }
        }

        if (classList.length > 0) {
            classes = ' class="' + classList.join(" ") + '" ';
        } else {
            classes = " ";
        }

        if (addAllOptions.length > 0) {
            options = addAllOptions.join(" ") + " ";
        } else {
            options = "";
        }

        return classes + options;

    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function getNewItem(item, readOnly, parentContainer) {

        //return an item in it's correct form

        //build in loads of stuff to ensure correct fields are returned
        var newItem = {};
        //sort the name field:

        if (!item.name) {
            if (!item.personFieldName) {
                if (!item.fieldName) {
                    if (!item.label) {
                        newItem.name = '';
                    } else {
                        newItem.name = item.label;
                    }

                } else {
                    newItem.name = item.fieldName;
                }
            } else {
                newItem.name = item.personFieldName;
            }
        } else {
            newItem.name = item.name;
        }

        newItem.id = 'f_' + item.elementNo;

        newItem.label = toTitleCase(!item.label ? newItem.name : item.label);

        newItem.type = !item.dataType ? 'text' : item.dataType;
        newItem.order = !item.order ? undefined : item.order;

        if (newItem.type === 'textarea') {
            newItem.rows = "auto";
        }


        if (item.mapsTo !== undefined) {

            newItem.mapsTo = item.mapsTo;

        }

        newItem.elementNo = item.elementNo;
        newItem.readonly = readOnly;
        newItem.parentReference = parentContainer;
        return newItem;

    }

    var buildHierarchy = function(arry, readOnly) {

        var roots = [],
            content = {},
            len,
            newItem,
            i;

        // find the top level nodes and hash the content based on parent
        for (i = 0, len = arry.length; i < len; ++i) {


            var item = arry[i],
                p = item.parent === undefined ? undefined : item.parent;

            //transform the item 

            if (item.hide !== true) {

                var target = p == undefined ? roots : (content[p] || (content[p] = []));

                newItem = getNewItem(item, readOnly, target);

                target.push(newItem);
            }
        }

        // function to recursively build the tree
        var findChildren = function(parent) {
            if (content[parent.elementNo]) {
                parent.content = content[parent.elementNo];
                for (var i = 0, len = parent.content.length; i < len; ++i) {
                    findChildren(parent.content[i]);
                }
            }
        };

        // enumerate through to handle the case where there are multiple roots
        for (i = 0, len = roots.length; i < len; ++i) {
            findChildren(roots[i]);
        }

        return roots;
    };

    this.createFormSchema = function(assessmentLayout, readOnly) {

        var fields = buildHierarchy(assessmentLayout, readOnly);
        return this.sort(fields);


    };

//custom sort function to 
    this.sort = function(tree) {

        var order = 0;

        function comparator(a, b) {

            if (a.order === undefined) {
                a.order = order;
                order++;
            } else {
            }

            if (b.order === undefined) {
                b.order = order;
                order++;
            } else {
            }

            return a.order < b.order ? 0 : 1;

        }

        function sortRecurse(el) {

            order = 0;

            el.sort(comparator);
            for (var i = el.length - 1; i >= 0; i--) {
                if (el[i].content) {

                    sortRecurse(el[i].content);

                }

            }
            return el;
        }

        return sortRecurse(tree);

    };

    this.findInArray = function(array, key, value) {

        for (var i = 0, len = arr.length; i < len; i++) {
            if (name in arr[i] && arr[i][name] == value) return i;
        }
        return false;
    };

    this.index = function index(obj, is, value) {
        if (typeof is == 'string')
            return index(obj, is.split('.'), value);
        else if (is.length == 1 && value !== undefined)
            return obj[is[0]] = value;
        else if (is.length == 0)
            return obj;
        else
            return index(obj[is[0]], is.slice(1), value);
    };

    this.getIndex = function(record, model, elementNo) {
        for (var i = 0; i < record[model].length; i++) {
            if (record[model][i]['elementNo'] === elementNo) {
                return i;
            }
        }
        return i;
    };

    this.updateOrder = function(scope) {
        var that = this;

        function traverse(el) {
            var index;
            for (var i = el.length - 1; i >= 0; i--) {
                index = that.getIndex(scope.record, scope.model, el[i].elementNo);
                scope.record[scope.model][index].order = el[i].order;
                if (el[i].content) {
                    traverse(el[i].content);
                }
            }
        }

        traverse(scope.hierarchy);
    }

});