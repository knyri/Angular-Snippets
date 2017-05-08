(function(angular){
	"use strict";
	angular.module('templateCaching',[])
	/**
	 * Template caching for ui-router (https://ui-router.github.io/)
	 * Also caches view templates
	 */
	.run(['$state', '$templateCache', '$http', function($state, $templateCache, $http){
		var url;
		function preload(v){
			// cache all templates unless explicity set to false
			if(v.preload !== false){
			// or cache only if set
//			if(v.preload){
				if(url = v.templateUrl){
					$http.get(url, { cache: $templateCache });
				}
			}

			if(v.views){
				for(var i in v.views){
					//recursive b/c of the nested view format I sometimes see
					preload(v.views[i]);
				}
			}
		}
		$state.get().forEach(preload);
	}])
	/**
	 * Template caching for ng-router
	 */
	.run(['$route', '$templateCache', '$http', function($route, $templateCache, $http){
		var url;
		$route.routes.forEach(function(v){
			// cache all templates unless explicity set to false
			if(v.preload !== false){
			// or cache only if set
//			if(v.preload){
				if(url = v.templateUrl){
					$http.get(url, { cache: $templateCache });
				}
			}
		});
	}]);;
})(angular);