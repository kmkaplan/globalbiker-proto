'use strict';

angular.module('globalbikerWebApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngMessages',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'leaflet-directive',
  'angularFileUpload',
  'pascalprecht.translate',
  'ui.tinymce',
    'ui.select',
    'angulartics', 'angulartics.piwik'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $translateProvider, uiSelectConfig, $analyticsProvider) {

        $translateProvider.preferredLanguage(['fr']);

        $translateProvider.determinePreferredLanguage(function () {
            if (navigator.language && navigator.language.lastIndexOf("fr", 0) === 0) {
                return "fr";
            } else {
                return "en";
            }
        });
    
        // Piwik seems to suppors buffered invocations so we don't need
        // to wrap these inside angulartics.waitForVendorApi
        $analyticsProvider.settings.trackRelativePath = true;
        $analyticsProvider.registerPageTrack(function (path) {
            if (window._paq) {
                _paq.push(['setCustomUrl', path]);
                _paq.push(['trackPageView']);
            }
        });
        $analyticsProvider.registerEventTrack(function (action, properties) {
            // PAQ requires that eventValue be an integer, see:
            // http://piwik.org/docs/event-tracking/
            if (properties.value) {
                var parsed = parseInt(properties.value, 10);
                properties.value = isNaN(parsed) ? 0 : parsed;
            }
            if (window._paq) {
                _paq.push(['trackEvent', properties.category, action, properties.label, properties.value]);
            }
        });

        tinyMCE.baseURL = '/bower_components/tinymce';

        uiSelectConfig.theme = 'bootstrap';

        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
        $translateProvider.useStaticFilesLoader({
            prefix: '/i18n/',
            suffix: '.json'
        });

    })

.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token') && (!config || !config.url || !config.url.indexOf || config.url.indexOf('http://api.geonames.org') !== 0)) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function (response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
        Auth.isLoggedInAsync(function (loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            }
        });
    });
});