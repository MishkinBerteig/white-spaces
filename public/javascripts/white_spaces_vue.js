
function boot_white_spaces() {
  console.log("booting...");
  // custom directives

  setup_directives();
  setup_whiteboard_directives();
  setup_exclusive_audio_video_playback();

  var data = {
    active_view: null,
    online: true,
    was_offline: false,
    account: "profile",
    logged_in: false,
    guest_nickname: null,
    embedded: false,
    user: {},

    active_profile: null,
    active_profile_spaces: [],
    active_dropdown: "none",

    creating_user: false,
    signup_error: null,
    login_error: null,
    password_reset_send: false,
    password_reset_error: null,
    password_reset_email: null,
    password_reset_confirm_error: null,
    reset_token: null,

    global_spinner: false
  };

  var methods = {
    activate_dropdown: function(id, evt) {
      if (this.active_dropdown == id) {
        this.active_dropdown = "none";
        return;
      }
      this.active_dropdown = id;
    },

    close_dropdown: function(evt) {
      if (evt) {
        if ($(evt.target).parents(".dropdown").length) {
          return;
        }
      }

      this.active_dropdown = "none";
    },

    translate: function() {
      return i18n.t(arguments)
    },
  };

  // mix in functions from all White-Spaces modules

  methods = _.extend(methods, WhiteSpacesUsers.methods);
  methods = _.extend(methods, WhiteSpacesWebsockets.methods);
  methods = _.extend(methods, WhiteSpacesSpaces.methods);
  methods = _.extend(methods, WhiteSpacesTeams.methods);
  methods = _.extend(methods, WhiteSpacesBoardArtifacts);
  methods = _.extend(methods, WhiteSpacesFormatting);
  methods = _.extend(methods, WhiteSpacesSections.methods);
  methods = _.extend(methods, WhiteSpacesAvatars.methods);
  methods = _.extend(methods, WhiteSpacesModals.methods);
  methods = _.extend(methods, WhiteSpacesAccount.methods);
  methods = _.extend(methods, WhiteSpacesRoutes);

  data = _.extend(data, WhiteSpacesUsers.data);
  data = _.extend(data, WhiteSpacesAccount.data);
  data = _.extend(data, WhiteSpacesWebsockets.data);
  data = _.extend(data, WhiteSpacesSpaces.data);
  data = _.extend(data, WhiteSpacesTeams.data);
  data = _.extend(data, WhiteSpacesSections.data);
  data = _.extend(data, WhiteSpacesAvatars.data);
  data = _.extend(data, WhiteSpacesModals.data);

  Vue.filter('select', function (array, key, operant, value) {
      var res = _.filter(array, function(e){
      var test = eval(e[key] + " " + operant + " " + value);
      return test;
    });
    return res;
  });

  Vue.filter('date', function (value, format) {
    var day = moment(value);
    return day.format(format).replace("\'", "").replace("\'", "");
  });

  Vue.filter('exceptFilter', function (array, key) {
    var filtered = _.filter(array, function(i){
      return i[key]==undefined;
    });
    return filtered;
  });

  Vue.filter('size', function (array) {
    return array.length;
  });

  Vue.filter('empty?', function (array) {
    return array.length==0;
  });

  Vue.filter('urls_to_links', function (text) {
    return urls_to_links(text);
  });

  window.white_spaces = new Vue({
    el: "body",
    data: data,
    methods: methods
  });

  var lang = "en";

  window.refreshLocale = function() {
    if (white_spaces && white_spaces.user && white_spaces.user.preferences) {
      lang = white_spaces.user.preferences.language || "en";
    } else if (window.browser_lang) {
      lang = window.browser_lang;
    }
  }

  window.refreshLocale();
  
  i18n.init({ lng: lang, resStore: window.locales }, function(err, t) {
    console.log("i18n initialized: "+lang);
  });

  window.__ = function() { 
    var params = Array.prototype.slice.call(arguments);
    params.shift();
    window.refreshLocale();
    return i18n.t(arguments[0], { postProcess: "sprintf", sprintf: params });
  };

  white_spaces.setup_section_module();
  white_spaces.load_user(function() {
    white_spaces.route();
  },function() {
    white_spaces.route();
  });

  window.addEventListener("paste", function(evt) {
    if (evt.target.nodeName=="INPUT" || (evt.target.nodeName=="TEXTAREA" && evt.target.id!="clipboard-ta") || evt.target.contenteditable) {
      // cancel
      return;
    }
    if (white_spaces.active_space) {
      white_spaces.handle_section_paste(evt);
    }
  });
}

document.addEventListener("DOMContentLoaded",function() {
  window.smoke = smoke;
  window.alert = smoke.alert;
  
  FastClick.attach(document.body);
  boot_white_spaces();
});
