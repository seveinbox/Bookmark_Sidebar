($ => {
    "use strict";

    $.FallbackHelper = function (n) {

        /**
         *
         * @returns {Promise}
         */
        this.init = async () => {
            const url = new URL(location.href);
            const typeParam = url.searchParams.get("type");

            if (typeParam !== null) {
                n.elm.topPages.addClass($.cl.hidden);
                n.elm.fallbackInfo.addClass($.cl.active);

                initDescription(typeParam);
                initEvents(typeParam);

                if ((typeParam === "new_tab" || typeParam === "fallback") && n.helper.model.getData("n/override") === false) {
                    initSetAsDefaultSwitch();
                }
            }
        };

        /**
         * Initialises the eventhandlers
         *
         * @param {string} type
         */
        const initEvents = (type) => {
            n.elm.fallbackInfo.children("a").on("click", (e) => {
                e.preventDefault();
                let suggestionType = "general";

                switch (type) {
                    case "notWhitelisted":
                    case "blacklisted":
                        suggestionType = "filter";
                        break;
                }

                chrome.tabs.create({url: chrome.extension.getURL("html/settings.html#feedback_error_" + suggestionType)});
            });
        };

        /**
         * Initialises the switch for setting the new tab page as default
         */
        const initSetAsDefaultSwitch = () => {
            const wrapper = $("<div />").appendTo(n.elm.fallbackInfo);
            const checkbox = n.helper.checkbox.get(n.elm.body, {}, "checkbox", "switch").appendTo(wrapper);
            $("<span />").html(n.helper.i18n.get("newtab_fallback_set_as_new_tab")).insertAfter(checkbox);

            checkbox.children("input[type='checkbox']").on("change", (e) => {
                if (e.currentTarget.checked) {
                    chrome.permissions.request({ // request additional permissions in order to override the new tab page
                        permissions: ["tabs", "topSites", "history"]
                    }, (granted) => {
                        if (granted) {
                            setAsNewtab(true);
                        } else { // not granted -> no overriding
                            checkbox.trigger("click");
                        }
                    });
                } else {
                    setAsNewtab(false);
                }
            });
        };

        /**
         * Enables or disables the new tab overriding
         *
         * @param {bool} val
         */
        const setAsNewtab = (val) => {
            chrome.storage.sync.get(["newtab"], (obj) => {
                const config = obj.newtab || {};
                config.override = val;
                chrome.storage.sync.set({newtab: config}, () => {
                    n.enabledSetAsNewtab = true;
                    n.helper.model.call("reinitialize");
                });
            });
        };

        /**
         * Initialises the description texts
         *
         * @param {string} type
         */
        const initDescription = (type) => {
            const texts = {
                headline: "newtab_fallback_headline_general",
                desc: "newtab_fallback_desc",
                link: "more_link"
            };

            switch (type) {
                case "new_tab":
                case "system":
                case "extension_page":
                case "webstore":
                    texts.headline = "newtab_fallback_headline_" + type;
                    break;
                case "notWhitelisted":
                case "blacklisted":
                    texts.headline = "newtab_fallback_headline_url_filter";
                    break;
            }

            $("<h2 />").text(n.helper.i18n.get(texts.headline)).appendTo(n.elm.fallbackInfo);
            $("<p />").text(n.helper.i18n.get(texts.desc)).appendTo(n.elm.fallbackInfo);
            $("<a />").text(n.helper.i18n.get(texts.link)).appendTo(n.elm.fallbackInfo);
        };

    };

})(jsu);