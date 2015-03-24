(function(window, $){
    
    $(document).on('click', 'a', function(e) {
        var url = $(this).attr('href');
        if (url && url.indexOf('.app') < 0) {
            return;
        }
        
        e.preventDefault();
        navigate(url);
    });
    
    var open = function(route, callback) {
        if (!route) {
            return;
        }
        
		$.get('/referencia/templates/' + route.replace(/\.app$/, '.html'), function(page) {
            $('main').html(page);
            
            History.pushState(null, null, '/referencia/' + route);
		});
	};
    
    var navigate = function(url) {
        open(url);
	};
    
    $(document).ready(function() {
        var match = /^.*?\/referencia\/(.*)/g.exec(document.URL);
        if (match) {
            open(match[1]);
        }
    });
    
    $.navigate = navigate;

})(window, jQuery);