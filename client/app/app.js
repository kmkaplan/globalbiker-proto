'use strict';

angular.module('globalbikerWebApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'leaflet-directive',
  'angularFileUpload',
  'pascalprecht.translate',
  'ui.tinymce', 'ui.select'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $translateProvider, uiSelectConfig) {


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

        $translateProvider.determinePreferredLanguage(function () {
            if (navigator.language.lastIndexOf("fr", 0) === 0) {
                return "fr";
            } else {
                return "en";
            }
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