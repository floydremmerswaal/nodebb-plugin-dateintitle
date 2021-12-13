'use strict';

const nconf = require.main.require('nconf');
const winston = require.main.require('winston');
const controllers = require('./lib/controllers');

const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = {};

plugin.init = async (params) => {
	const { router, middleware/* , controllers */ } = params;

	/**
	 * We create two routes for every view. One API call, and the actual route itself.
	 * Use the `setupPageRoute` helper and NodeBB will take care of everything for you.
	 *
	 * Other helpers include `setupAdminPageRoute` and `setupAPIRoute`
	 * */
	routeHelpers.setupPageRoute(router, '/dateintitle', middleware, [(req, res, next) => {
		winston.info(`[plugins/dateintitle] In middleware. This argument can be either a single middleware or an array of middlewares`);
		setImmediate(next);
	}], (req, res) => {
		winston.info(`[plugins/dateintitle] Navigated to ${nconf.get('relative_path')}/dateintitle`);
		res.render('dateintitle', { uid: req.uid });
	});

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/dateintitle', middleware, [], controllers.renderAdminPage);
};

/**
 * If you wish to add routes to NodeBB's RESTful API, listen to the `static:api.routes` hook.
 * Define your routes similarly to above, and allow core to handle the response via the
 * built-in helpers.formatApiResponse() method.
 *
 * In this example route, the `authenticate` middleware is added, which means a valid login
 * session or bearer token (which you can create via ACP > Settings > API Access) needs to be
 * passed in.
 *
 * To call this example route:
 *   curl -X GET \
 * 		http://example.org/api/v3/plugins/dateintitle/test \
 * 		-H "Authorization: Bearer some_valid_bearer_token"
 *
 * Will yield the following response JSON:
 * 	{
 *		"status": {
 *			"code": "ok",
 *			"message": "OK"
 *		},
 *		"response": {
 *			"foobar": "test"
 *		}
 *	}
 */
plugin.addRoutes = async ({ router, middleware, helpers }) => {
	const middlewares = [
		// middleware.ensureLoggedIn,			// use this if you want only registered users to call this route
		// middleware.admin.checkPrivileges,	// use this to restrict the route to administrators
	];

	routeHelpers.setupApiRoute(router, 'get', '/dateintitle/:param1', middlewares, (req, res) => {
		helpers.formatApiResponse(200, res, {
			foobar: req.params.param1,
		});
	});
};

plugin.addAdminNavigation = (header) => {
	header.plugins.push({
		route: '/plugins/dateintitle',
		icon: 'fa-tint',
		name: 'Date in title',
	});

	return header;
};

plugin.addDateToTitle = (data) => {
	let text = data.data.content;
	let regexStart = /\[startDate\](.*)\[\/startDate\]/;
	let regexLocation = /\[location\](.*)\[\/location\]/;
	if (regexStart.test(text)){
		let starttime = parseInt(text.match(regexStart)[1]);
		let location = text.match(regexLocation)[1];
	
		let dateobj = new Date(starttime)
    	let date = dateobj.getDate(); // 0-31
		let dag = dateobj.getDay(); // 0-6
		let maand = dateobj.getMonth() + 1; // months are 0-11
		let jaar = dateobj.getFullYear();

		let datum = `${date}-${maand}-${jaar}`
		const weekday = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];
		let weekdag = weekday[dag]

		let newtitle = `${data.data.title} (${weekdag} ${datum} @ ${location})`

		data.data.title = newtitle;
		data.topic.title = newtitle;
	}
	console.log("end of function");
	return data;
}

module.exports = plugin;
