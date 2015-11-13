
var subscription;

$('.search').submit(function(event) {
  event.preventDefault();
  clearResult();

  if (subscription) {
    subscription.dispose();
  }

  var word = $('[name="word"]').val();

  var source = Rx.Observable.range(1, 5).
      concatMap(function(page) {
        var s = Rx.Observable.fromCallback(function(callback) {
          $.get('http://localhost:3000/baidu?word=' + word + '&page=' + page, callback);
        });
        return s();
      }).
      map(function(item) {
        return item[0];
      }).
      scan(function(preVal, curItem) {
        preVal.push({
          page: preVal.length + 1,
          links: curItem
        });
        return preVal;
      }, []);

  subscription = source.subscribe(onNext, onErr, onComplete);
});

function onNext(pageContent) {
  render(pageContent);
}

function onErr(err) {

}

function onComplete() {
  vm.getHostnames();
  $('.hostnames').addClass('active');
}

function render(pageContent) {
  vm.result(pageContent);
}

function clearResult() {
  vm.result([]);
  vm.hostnames([]);
  vm.filterUrl('');
  $('.hostnames').removeClass('active');
}


function Constructor() {
  var self = this;
  self.result = ko.observableArray([]);
  self.filterUrl = ko.observable('');

  self.filter = function(data, event) {
    $('.hostnames-item.active').removeClass('active');
    $(event.target).parent('.hostnames-item').addClass('active');
    self.filterUrl(data.url);
  };

  self.renderData = ko.computed(function() {
    var url = self.filterUrl();
    var ret = self.result().map(function(page, index, array) {
      return {
        page: page.page,
        links: page.links.map(function(item, index, array) {
          if (url && item.info.indexOf(url) == -1) {
            item.matchFilter = false;
          } else {
            item.matchFilter = true;
          }
          return item;
        }),
      };
    });

    return ret;
  });

  self.hostnames = ko.observableArray([]);

  self.getHostnames = function() {
    var hostnames = self.result().map(function(item, index, array) {
      return item.links.map(function(link, index, array) {
        return link.info? link.info.split(' ')[0].match(/.[^\/]*/)[0] : '';
      });
    }).reduce(function(previousValue, currentItem, index, array) {
      return previousValue.concat(currentItem);
    }, []);

    var uniqHostnames = hostnames.filter(function(item, index, array) {
      return item && array.indexOf(item) == index;
    });

    uniqHostnames = uniqHostnames.map(function(url, index, array) {
      var count = hostnames.filter(function(item, index, array) {
        return item == url;
      }).length;

      return {
        url: url,
        count: count
      };
    }).sort(function(a, b) {
      return b.count - a.count;
    });

    self.hostnames(uniqHostnames);
  };
}

var vm = new Constructor();
ko.applyBindings(vm);