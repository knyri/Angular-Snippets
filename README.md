Angular Snippets
================

A collection of snippets that I've found useful.

http.js
=======

Currently only contains a wrapper that adds better caching. The default cache for $http caches forever.
The cache used here respects Expires and Cache-Control headers.


template-caching.js
===================

A couple of runs that will cache templates for ngRouter routes and uiRouter state views.