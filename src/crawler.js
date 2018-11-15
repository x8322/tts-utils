const _ = require('lodash'),
	async = require('async'),
	config = require('config'),
	utils = require('./utils'),
	request = require('request'),
	cheerio = require('cheerio');

_.each(config.sites, (site) => {
	request(site.url, function(err, response, body) {
		if (err)
			return console.log(err);
		var $ = cheerio.load(body);
		var links = $('ul > li > a');
		var categories = _.map(links, (e) => {
			return {
				name: $(e).text(),
				url: $(e).attr('href')
			};
		});
		console.log(categories);
		utils.writeYml('./data/sachvui.yml', categories, function(err){
			console.log(err);
		});
	});
});