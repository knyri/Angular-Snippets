(function(angular){
	"use strict";
	angular.module('httpSnippets',[])
	/**
	 * An HTTP cache that is aware of the Expires and Cache-Control headers.
	 * This is a wrapper for $http. (i.e. use it as a drop-in replacement for $http)
	 * There is a version below that uses Moment.js if you don't trust the built-in
	 * Date object.
	 * Ex. ['httpCache', function($http){}]
	 */
	.factory('httpCache',['$q','$http',function($q, $http){
		// $http wrapper that replaces the default cache
		var caches= {'$http':{}};
		return function(config){
			if('object' == typeof config.cache){
				// no caching or using the default cache
				return $http(config);
			}

			var cache= caches['$http'];
			if('string' == typeof config.cache){
				cache= caches[config.cache];
				if(!cache){
					cache= caches[config.cache]= {};
				}
			}
			// prevent $http from caching
			delete config.cache;

			var item= cache[config.url] || {},
				expired= (item.expires) ? item.expires < Date.now() : true;
			if(item.promise){
				return item.promise;
			}
			if(!expired){
				// not expired! Use the stored result
				return $q(function(resolve){
					resolve(item.resp);
				});
			}
			if(item.resp && item.resp.headers('Date')){
				// add the If-Modified-Since to possibly save some bandwidth
				if(!config.headers){
					config.headers= {};
				}
				config.headers['If-Modified-Since']= item.resp.headers('Date');
			}
			return (cache[config.url]= {
				promise: $http(config).then(function(resp){
					if(resp.status == 206){
						// Never cache partial content; huge headache
						return resp;
					}
					if(resp.status == 304){
						// not modified; use cached version
						return item.resp;
					}
					// pragma included for HTTP/1.0
					var expires= resp.headers('Cache-Control') || resp.headers('Pragma');
					if(expires){
						if(expires == 'no-cache'){
							// explicit no-cache; don't cache
							return resp;
						}
						expires= expires.split('=');
						if(expires.length == 2 && (expires[0] == 'max-age' || expires[0] == 's-maxage')){
							expires= Date.now() + parseInt(expires[1], 10) * 1000;
						}else{
							expires= false;
						}
					}

					// ===================
					expires= expires || (new Date(resp.headers('Expires'))).getTime();

					cache[config.url]= {resp: resp, expires: expires};
					// ----------------------------------------------
					return resp;
				})
			}).promise;
		}
	}])
	/**
	 * An HTTP cache that is aware of the Expires and Cache-Control headers.
	 * This is a wrapper for $http. (i.e. use it as a drop-in replacement for $http)
	 * Relies on Moment.js (https://momentjs.com/)
	 * There is a version above that uses the built-in Date object
	 * Ex. ['httpCacheMoment', function($http){}]
	 */
	.factory('httpCacheMoment',['$q','$http',function($q, $http){
		// Relies on Moment.js (https://momentjs.com/)
		var caches= {'$http':{}};
		return function(config){
			if('object' == typeof config.cache){
				// no caching or using the default cache
				return $http(config);
			}

			var cache= caches['$http'];
			if('string' == typeof config.cache){
				cache= caches[config.cache];
				if(!cache){
					cache= caches[config.cache]= {};
				}
			}
			delete config.cache;

			var item= cache[config.url] || {},
				expired= (item.expires) ? item.expires < Date.now() : true;
			if(item.promise){
				return item.promise;
			}
			if(!expired){
				// not expired! Use the stored result
				return $q(function(resolve){
					resolve(item.resp);
				});
			}
			if(item.resp && item.resp.headers('Date')){
				// add the If-Modified-Since to possibly save some bandwidth
				if(!config.headers){
					config.headers= {};
				}
				config.headers['If-Modified-Since']= item.resp.headers('Date');
			}
			return (cache[config.url]= {
				promise: $http(config).then(function(resp){
					if(resp.status == 206){
						// Never cache partial content; huge headache
						return resp;
					}
					if(resp.status == 304){
						// not modified; use cached version
						return item.resp;
					}
					// pragma included for HTTP/1.0
					var expires= resp.headers('Cache-Control') || resp.headers('Pragma');
					if(expires){
						if(expires == 'no-cache'){
							// explicit no-cache; don't cache
							return resp;
						}
						expires= expires.split('=');
						if(expires.length == 2 && (expires[0] == 'max-age' || expires[0] == 's-maxage')){
							expires= moment().add(parseInt(expires[1], 10), 'seconds');
						}else{
							expires= false;
						}
					}

					// ===================
					expires= expires || moment(resp.headers('Expires'));
					if(!expires.isValid()){
						expires= null;
					}else{
						expires= expires.valueOf();
					}

					cache[config.url]= {resp: resp, expires: expires};
					// ----------------------------------------------
					return resp;
				})
			}).promise;
		}
	}]);
})(angular);
