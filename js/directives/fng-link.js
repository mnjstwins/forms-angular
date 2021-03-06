'use strict';
formsAngular
  .directive('fngLink', function (routingService, SubmissionsService) {
    return {
      restrict: 'E',
      scope: {dataSrc: '&model'},
      link: function (scope, element, attrs) {
        var ref = attrs.ref;
        var form = attrs.form;
        scope.readonly = attrs.readonly;
        form = form ? form + '/' : '';
        if (attrs.text && attrs.text.length > 0) {
          scope.text = attrs.text;
        }
        scope.$watch('dataSrc()', function (newVal) {
          if (newVal) {
            scope.link = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
            if (!scope.text) {
              SubmissionsService.getListAttributes(ref, newVal).success(function (data) {
                if (data.success === false) {
                  console.log(data.err);
                  scope.text = data.err;
                } else {
                  scope.text = data.list;
                }
              }).error(function (status, err) {
                scope.text = 'Error ' + status + ': ' + err;
              });
            }
          }
        }, true);
      },
      template: function(element,attrs) {
        return attrs.readonly ? '<span class="fng-link">{{text}}</span>' : '<a href="{{ link }}" class="fng-link">{{text}}</a>';
      }
    };
  });
