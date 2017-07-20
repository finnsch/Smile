'use strict';

var https = require('https');
var fs = require('fs');

function download(url, callback) {
	https.get(url, function(res) {
		var data = "";
		res.on('data', function (chunk) {
		  data += chunk;
		});

		res.on("end", function() {
		  callback(data);
		});

	}).on("error", function() {
	  	callback(null);
	});
}

download('https://cdn.rawgit.com/github/gemoji/master/db/emoji.json', function(data) {
  parse(data, 9.1);
  parse_categories(data, 9.1);
});

function parse(data, maxIosVersion) {
  const json = JSON.parse(data);

  var string = 'public let emojiList: [String: String] = [\n'
  for (var i=0; i<json.length; ++i) {
    const item = json[i];

    if (typeof item.aliases === "undefined"
    || typeof item.ios_version === "undefined"
    || typeof item.emoji === "undefined"
    || item.emoji == "undefined") {
      continue;
    }

    const iosVersion = Number.parseFloat(item.ios_version);

    if (maxIosVersion && iosVersion > maxIosVersion) {
      continue;
    }

    const itemString = '  "' + item.aliases[0] + '": "' + item.emoji + '",\n'
    string = string + itemString
  }

  string = string + ']'

  fs.writeFile('../Sources/Emoji.swift', string);
};


function parse_categories(data, maxIosVersion) {
  const json = JSON.parse(data);
  const categories = {};

  var string = 'public let emojiCategories: [String: [String]] = [\n'
  for (var i=0; i<json.length; ++i) {
    const item = json[i];

    if (typeof item.aliases === "undefined"
    || typeof item.category === "undefined"
    || typeof item.category === "undefined"
    || typeof item.ios_version === "undefined"
    || item.emoji == "undefined") {
      continue;
    }

    const category = item.category.toLowerCase();
    const iosVersion = Number.parseFloat(item.ios_version);

    if (maxIosVersion && iosVersion > maxIosVersion) {
      continue;
    }

    if (categories[category]) {
      categories[category].push(item.emoji);
    } else {
      categories[category] = [];
    }
  }

  Object.keys(categories).forEach(function (category) {
    const emojis = categories[category].map(function(emoji) {
      return '"' + emoji + '"';
    }).join(",");

    const itemString = '  "' + category + '": [' + emojis + '],\n'
    string = string + itemString;
  });

  string = string + ']'

	fs.writeFile('../Sources/Categories.swift', string);
};
