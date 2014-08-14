   function smoothScroll(targetLink) {
        if (targetLink.length) {
            $('html,body').animate({
                scrollTop: $("#"+ targetLink).offset().top
            }, 1000);
            return false;
        }
    };
