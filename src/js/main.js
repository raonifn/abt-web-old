(function($, Mustache) { 
    CEA = {};
    var currentLanguage = 'pt-BR';
    
    $(document).ready(function() {
        render();
    });

    function render() {
        var nav = $('nav');
        var header = $('header');
        
        $.get('/referencia/user/me', function(response) {
            CEA.user = response.user;
            
            header.html(Mustache.render(header.html(), CEA.user));
        }).then(function() {
            $.get('/referencia/menu.json', function(menu) {
                var menuBuilder = {
                    render: function() {
                        return function(text, render) {
                            return this.renderItems(menu);
                        }
                    },
                    renderItems: function(items) {
                        var menuHtml = '';
                        for (var e in items) {
                            var item = items[e];
                            
                            if (!this.userHasAccess(item)) {
                                continue;
                            }
                            
                            menuHtml += Mustache.render('<li><a href=\'{{url}}\' i18n=\'{{labelKey}}\' menu-item></a>', item);

                            if (!item.itens) {
                                menuHtml +='</li>';
                                continue;
                            }

                            menuHtml += '<ul class=\'dl-submenu\'>';
                            menuHtml += this.renderItems(item.itens);
                            menuHtml += '</ul>';
                        }
                        return menuHtml;
                    },
                    userHasAccess: function(menu) {
                        if (!menu.grupos) {
                            return true;
                        }
                        var grupos = menu.grupos.split(',');
                        for (var i in grupos) {
                            var grupo = grupos[i].replace(/ +$/, '').replace(/^ +/, '');
                            if (CEA.user.roles.indexOf(grupo) >= 0) {
                                return true;
                            }
                        }
                        return false;
                    }
                };
                nav.html(Mustache.render(nav.html(), menuBuilder));
                $('.dl-menuwrapper').dlmenu({
                    animationClasses : { classin : 'dl-animate-in-5', classout : 'dl-animate-out-5' },
                    onLinkClick: function(item, e) {
                        $.navigate($(e.target).attr('href'));
                        e.preventDefault();
                    }
                });
                
                updateBundles();
            });
        }).fail(function() {
            header.html(Mustache.render(header.html()));
            nav.html(Mustache.render(nav.html()));
            
            $.navigate('/referencia/403.app');
            updateBundles();
        });
    }
    
    function updateBundles() {
        $('[i18n]').each(function(i, e) {
            me = $(e);
            me.html(bundles[me.attr('i18n')] || me.attr('i18n'));
        });
    }
    
    CEA.changeLanguage = function(language) {
        if (currentLanguage === language) {
            return;
        }
        $.get('/referencia/locales/' + language + '.js', function(response) {
            currentLanguage = language;
            updateBundles();
        });
    };
    
})(jQuery, Mustache);