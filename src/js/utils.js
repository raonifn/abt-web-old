(function() {
    CEA = CEA || {};
    
    CEA.setupAnchorElements = function() {
        var isScrolling = false;
        var setActive = function(el) {
            $('.anchor > li > a').removeClass('active');
            el.addClass('active');
        };
        $('.anchor > li > a').click(function(e) {
            var self = $(this);
            setActive(self);

            e.preventDefault();
            e.stopPropagation();

            var target = self.attr('anchor');

            isScrolling = true;
            $('html, body').animate({
                scrollTop: $('.' + target).offset().top
            }, 750, function() {
                isScrolling = false;
            });
        });

        var sticky = new Waypoint.Sticky({
            element: $('.anchor')[0]
        });
        var waypoints = $('section').waypoint({
            handler: function(direction) {
                if (!isScrolling) {
                    var el = $(this.element).attr('class');
                    setActive($('.anchor > li > a[anchor=' + el + ']'));
                }
            },
            offset: 3
        });
    };
})(jQuery);