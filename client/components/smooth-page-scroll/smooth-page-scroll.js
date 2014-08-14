   function smoothScroll(targetLink, timeout) {
       setTimeout(function () {
            if (targetLink.length) {
                $('html,body').animate({
                    scrollTop: $("#"+ targetLink).offset().top
                }, 1000);
                return false;
            }
       }, timeout === null ? 1 : timeout);
    };
