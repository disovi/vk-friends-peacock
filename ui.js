function makeScrollable(wrapper, scrollable) {
    var wrapper = $(wrapper),
        scrollable = $(scrollable);

    scrollable.hide();
    var loading = $("<div class='loading'></div>").appendTo(wrapper);

    var interval = setInterval(function() {
        var images = scrollable.find("img");
        var completed = 0;

        images.each(function() {
            if (this.complete) completed++;
        });

        if (completed == images.length) {
            clearInterval(interval);
            setTimeout(function() {

                loading.hide();
                wrapper.css({
                    overflow: "hidden"
                });

                scrollable.slideDown("slow", function() {
                    enable();
                });
            }, 1000);
        }
    }, 100);

    function enable() {
        var inactiveMargin = 100;

        var wrapperWidth = wrapper.width();
        var wrapperHeight = wrapper.height();

        var scrollableHeight = scrollable.outerHeight() + 2 * inactiveMargin;

        wrapper.mousemove(function(e) {
            var wrapperOffset = wrapper.offset();
            var top = (e.pageY - wrapperOffset.top) * (scrollableHeight - wrapperHeight) / wrapperHeight - inactiveMargin;

            if (top < 0) {
                top = 0;
            }

            wrapper.scrollTop(top);
        });
    }
}

function fill_friend_list(friend_list) {
    if ($('.contact').length > 0)
        return;

    friend_list.forEach(function(e) {
	var mobile = "";

	if (e.mobile_phone !== undefined) {
	    mobile = e.mobile_phone;
	}

        $('div.sc_menu').append("<a title='" + mobile + "'" + "class='contact' href='#' onclick='peacock(" + e.uid  + ", 1);'>"
				+ "<img class='contact_photo fl_l' src='" + e.photo + "'/>"
				+ "<span class='contact_name fl_l'>" + e.first_name + " " + e.last_name + "</span>"
				+ "</a>");
    });
}

$(function() {
    makeScrollable("div.sc_menu_wrapper", "div.sc_menu");
});
