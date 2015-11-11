$('#search').submit(function(event) {
  event.preventDefault();
  clear();

  var result = [];
  var word = $('[name="word"]').val();
  var urls = [];
  var i = 1;
  while (i <= 5) {
    result[i - 1] = undefined;

    (function(page) {
      $.get('http://localhost:3000/baidu?word=' + word + '&page=' + page, function(res) {
        result[page - 1] = {
          page: page,
          links: res
        };

        render(result);

        var isFull = result.every(function(item, index, array) {
          return item;
        });

        if (isFull) {
          onFull(result);
        }
      });
    })(i);

    i++;
  }
});

function onFull(result) {
  vm.getHostnames();
  $('#hostnames').addClass('active');
}

function clear() {
  vm.result([]);
  vm.hostnames([]);
  vm.filterUrl('');
  $('#hostnames').removeClass('active');
}

function render(result) {
  var ret = [];
  for (var i = 0, len = result.length; i < len; i++) {
    var item = result[i];
    if (!item) {
      break;
    } else {
      ret.push(item);
    }
  }

  vm.result(ret);
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

    var ret = hostnames.filter(function(item, index, array) {
      return item && array.indexOf(item) == index;
    });

    ret = ret.map(function(url, index, array) {
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

    self.hostnames(ret);
  };
}

var vm = new Constructor();
ko.applyBindings(vm);