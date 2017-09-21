/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("minimist");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dockerode = __webpack_require__(21);

var _dockerode2 = _interopRequireDefault(_dockerode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var docker = new _dockerode2.default({ socketPath: '/var/run/docker.sock' });
exports.default = docker;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("passport");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("superagent");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.matchLibraries = matchLibraries;
exports.flatten = flatten;
exports.dedup = dedup;
exports.createTarFile = createTarFile;
exports.createDockerImage = createDockerImage;
exports.uploadImageToRegistry = uploadImageToRegistry;
exports.stopAndRemoveContainer = stopAndRemoveContainer;
exports.createTestContainer = createTestContainer;
exports.writeTempFile = writeTempFile;
exports.removeTempFile = removeTempFile;

var _zlib = __webpack_require__(22);

var _zlib2 = _interopRequireDefault(_zlib);

var _fs = __webpack_require__(1);

var _fs2 = _interopRequireDefault(_fs);

var _tarStream = __webpack_require__(23);

var _tarStream2 = _interopRequireDefault(_tarStream);

var _docker = __webpack_require__(3);

var _docker2 = _interopRequireDefault(_docker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function matchLibraries(code) {

	var REQUIRE_RE = /require\(['"]([^'"]+)['"](?:, ['"]([^'"]+)['"])?\);?/g;
	var IMPORT_RE = /\bimport\s+(?:.+\s+from\s+)?[\'"]([^"\']+)["\']/g;

	var requires = code.match(REQUIRE_RE);
	var imports = code.match(IMPORT_RE);
	var r1 = [],
	    r2 = [];

	if (requires && requires.length > 0) {
		r1 = requires.map(function (pkg) {
			return pkg.replace(/require\w*\(\w*['"]/g, "").replace(/['"]\);*/g, "");
		});
	}

	if (imports && imports.length > 0) {
		r2 = imports.map(function (module) {
			return module.replace(/import\s*/g, "").replace(/\s*(\w|\W|\s)*from\s*/g, "").replace(/['"]/g, "");
		});
	}

	return [].concat(_toConsumableArray(r1), _toConsumableArray(r2));
}

function flatten(arr) {
	return arr.reduce(function (acc, row) {
		return row.reduce(function (acc, src) {
			acc.push(src);
			return acc;
		}, acc);
	}, []);
}

function dedup(arr) {
	var seen = {};
	return arr.filter(function (item) {
		if (seen[item]) return false;
		seen[item] = true;
		return true;
	});
}

var _addEntry = function _addEntry(pack, name, file) {
	return new Promise(function (resolve, reject) {
		pack.entry({ name: name }, file, function (err) {
			if (err) {
				console.log("error adding entry!", err);
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
};

function createTarFile(dockerfile, flowfile, path) {

	var tarball = _fs2.default.createWriteStream(path);
	var gzip = _zlib2.default.createGzip();
	var pack = _tarStream2.default.pack();

	return _addEntry(pack, "Dockerfile", dockerfile).then(function () {
		return _addEntry(pack, "flows.json", flowfile);
	}).then(function () {

		pack.finalize();

		var stream = pack.pipe(gzip).pipe(tarball);

		return new Promise(function (resolve, reject) {

			stream.on('finish', function (err) {
				if (err) {
					console.log("error creating tar file", err);
					reject(err);
				} else {
					console.log("successfully created tar file", path);
					resolve(path);
				}
			});
		});
	});
}
/*return new Promise((resolve, reject)=>{
	var tarball = fs.createWriteStream(path);
	const gzip   = zlib.createGzip();
	const pack   = tar.pack();
	pack.entry({name: 'Dockerfile'}, dockerfile, function(err){
		if (err){
			reject(err);
		}
		
		console.log("am herwe");
		
		pack.entry({name: "flows.json"}, flowfile, function(err){
			if (err){
			
       	   		reject(err);
       		}
       		console.log("finalising");
       		pack.finalize();
       	
       		const stream = pack.pipe(gzip).pipe(tarball);
	
			stream.on('finish', function (err) {
				resolve(path);
			});	
		});
	});
})
}*/

/*export function createTarFile(dockerfile, path){
		
	return new Promise((resolve, reject)=>{
		
		var tarball = fs.createWriteStream(path);
		const gzip   = zlib.createGzip();
		const pack   = tar.pack();
	
		pack.entry({name: 'Dockerfile'}, dockerfile, function(err){
        	if (err){
        	   reject(err);
        	}
        	pack.finalize();
        	
        	const stream = pack.pipe(gzip).pipe(tarball);
		
			stream.on('finish', function (err) {
				resolve(path);
			});	
		});
	});
}*/

function createDockerImage(tarfile, tag) {

	console.log('creating image for tarfile ' + tarfile + ' with tag ' + tag);

	return new Promise(function (resolve, reject) {
		_docker2.default.buildImage(tarfile, { t: tag, nocache: true }, function (err, output) {
			if (err) {
				console.warn(err);
				reject(err);
			}
			output.pipe(process.stdout);

			output.on('end', function () {
				resolve(tag);
			});
		});
	});
}

function uploadImageToRegistry(tag, registry) {

	return new Promise(function (resolve, reject) {
		if (registry && registry.trim() !== "") {
			console.log("uploading to registry", registry);

			var image = _docker2.default.getImage(tag);
			image.push({
				registry: registry
			}, function (err, data) {
				data.pipe(process.stdout);
				if (err) {
					reject(err);
				}
				resolve();
			});
		} else {
			resolve();
		}
	});
}

function stopAndRemoveContainer(name) {

	return new Promise(function (resolve, reject) {

		var container = _docker2.default.listContainers(function (err, containers) {

			if (err) {
				reject(err);
			}

			var container = containers.reduce(function (acc, container) {
				if (container.Names.indexOf('/' + name) != -1) {
					return container;
				}
				return acc;
			}, null);

			if (!container) {
				console.log("did not find running container");
				resolve(true);
				return;
			}

			var containerToStop = _docker2.default.getContainer(container.Id);

			containerToStop.stop(function (err, data) {
				console.log("container stopped!");
				if (err) {
					reject(err);
				}
				containerToStop.remove(function (err, data) {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
			});
		});
	});
}

/*
 note we open port 9123  to open a websocket to receive video from the client when 
 a webcam is used and 8096 is the (docker mapped) port that serves up the webcam page
*/
function createTestContainer(image, name, network) {
	console.log('creating test container ' + image + ', name: ' + name);
	return new Promise(function (resolve, reject) {
		_docker2.default.createContainer({ Image: image,
			PublishAllPorts: true,
			Links: ["mock-datasource:mock-datasource", "databox-test-server:databox-test-server" /*, "openface:openface"*/],
			Env: ["TESTING=true", "MOCK_DATA_SOURCE=http://mock-datasource:8080"],
			//HostConfig: {NetworkMode: network},
			Labels: { 'user': '' + name },
			ExposedPorts: { "1880/tcp": {}, "9123/tcp": {}, "8096/tcp": {} },
			PortBindings: { "9123/tcp": [{ "HostPort": "9123" }] },
			Cmd: ["npm", "start", "--", "--userDir", "/data"],
			name: name + '-red'
		}, function (err, container) {
			if (err) {
				console.log(err);
				reject(err);
			} else {

				container.start({}, function (err, data) {
					if (err) {
						console.log("error starting container", err);
						reject(err);
					} else {
						resolve(container);
					}
				});
			}
		});
	});
}

function writeTempFile(filestr, fileName) {

	return new Promise(function (resolve, reject) {
		_fs2.default.writeFile(fileName, filestr, function (err) {
			if (err) {
				reject(err);
			}

			resolve(true);
		});
	});
}

function removeTempFile(fileName) {
	return new Promise(function (resolve, reject) {
		_fs2.default.unlink(fileName, function (err) {
			if (err) {
				console.log(err);
				reject(err);
			}
			resolve(true);
		});
	});
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(9);


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _http = __webpack_require__(10);

var _http2 = _interopRequireDefault(_http);

var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _expressSession = __webpack_require__(11);

var _expressSession2 = _interopRequireDefault(_expressSession);

var _connectRedis = __webpack_require__(12);

var _connectRedis2 = _interopRequireDefault(_connectRedis);

var _bodyParser = __webpack_require__(13);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = __webpack_require__(14);

var _strategies = __webpack_require__(15);

var _strategies2 = _interopRequireDefault(_strategies);

var _minimist = __webpack_require__(2);

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RedisStore = (0, _connectRedis2.default)(_expressSession2.default);
var argv = (0, _minimist2.default)(process.argv.slice(2));

var PORT = argv.port || 8086;
var dev = argv.dev || false;
console.log("set port to", PORT);
console.log("dev mode ", dev);

(0, _config.fetch)({ dev: dev }).then(function (config) {
  start(config);
}, function (err) {
  console.log("ok am here!!");
  console.log("error reading config!", err);
});

function checkcredentials(config) {
  console.log("checking credentials for ", JSON.stringify(config, null, 4));
  var _config$github = config.github,
      CLIENT_ID = _config$github.CLIENT_ID,
      CLIENT_SECRET = _config$github.CLIENT_SECRET,
      CALLBACK = _config$github.CALLBACK;

  return CLIENT_ID.trim() != "" && CLIENT_SECRET.trim() != "" && CALLBACK.trim() != "";
}

function addroutes(app, auth) {
  console.log("adding routes!");
  app.use('/auth', __webpack_require__(19));
  app.use('/github', auth, __webpack_require__(20));
  app.use('/nodered', auth, __webpack_require__(24));
  app.use('/samples', auth, __webpack_require__(25));
  app.use('/uibuilder', auth, __webpack_require__(26));
}

function start(config) {

  var app = (0, _express2.default)();

  //to support posts!
  app.use(_bodyParser2.default.urlencoded({ extended: false, limit: '5mb' }));
  app.use(_bodyParser2.default.json({ limit: '5mb' }));

  app.use((0, _expressSession2.default)({
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port
    }),
    key: 'express.sid',
    resave: false,
    rolling: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000 //2 days
    },
    secret: config.secret
  }));

  app.set('view engine', 'html');
  app.engine('html', __webpack_require__(28).renderFile);

  var server = _http2.default.createServer(app);

  var auth = function auth(req, res, next) {

    if (req.isAuthenticated()) {
      req.config = config;
      return next(null);
    }

    res.redirect("/login");
  };

  if (checkcredentials(config)) {
    (0, _strategies2.default)(app, config);
    addroutes(app, auth);
  }

  app.get('/login', function (req, res) {
    res.render('login');
  });

  app.use('/', _express2.default.static("static"));

  app.get('/', function (req, res) {

    if (!checkcredentials(config)) {
      console.log("credentials are empty, so redirecting to settings");
      res.redirect('/settings');
      return;
    }

    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }

    res.render('index');
  });

  app.get('/settings', function (req, res) {
    if (checkcredentials(config)) {
      res.render('settings', { title: "great, you have updated your config settings", config: "[secret]" });
    } else {
      res.render('settings', { title: "Nearly there - you just need set your github settings", config: JSON.stringify(config.github || {}, null, 4) });
    }
  });

  app.get('/settings/testurl', function (req, res) {
    res.send({ testurl: config.testserver.URL });
  });

  console.log('listening on port ' + PORT);
  server.listen(PORT);
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("express-session");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("connect-redis");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
        value: true
});
exports.fetch = fetch;
exports.write = write;
exports.defaultdevsettings = defaultdevsettings;
exports.defaultsettings = defaultsettings;

var _fs = __webpack_require__(1);

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetch() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


        return new Promise(function (resolve, reject) {

                _fs2.default.readFile("./conf/settings.json", 'utf8', function (err, data) {
                        if (err) {
                                return write(JSON.stringify(options.dev ? defaultdevsettings() : defaultsettings(), null, 4));
                        }
                        try {
                                var settings = JSON.parse(data);
                                resolve(settings);
                        } catch (err) {
                                console.log("error reading settings file!", err);
                                reject(defaultsettings());
                        };
                });
        });
}

function write(file) {
        return new Promise(function (resolve, reject) {
                _fs2.default.mkdir("./conf", function () {

                        _fs2.default.writeFile("./conf/settings.json", file, function (err) {
                                if (err) {
                                        console.log("hmmm error writing conf/settings.json");
                                        reject(JSON.parse(file));
                                }
                                resolve(JSON.parse(file));
                        });
                });
        });
}

function defaultdevsettings() {
        return {

                "secret": "asdaksgdsahgdhsagd ahjsgdjhsg",

                "github": {
                        "CLIENT_ID": "",
                        "CLIENT_SECRET": "",
                        "CALLBACK": "http://localhost:8086/auth/github/callback",
                        "API": "https://api.github.com",
                        "RAW_URL": "https://raw.githubusercontent.com",
                        "URL": "https://github.com"
                },

                "appstore": {
                        "URL": "http://localhost:8091"
                },

                "registry": {
                        "URL": "localhost:5000"
                },

                "mongo": {
                        "URL": "mongodb://localhost:27017"
                },

                "redis": {
                        "host": "localhost",
                        "port": 6379
                },

                "testserver": {
                        "URL": "http://localhost:9090"
                }

        };
}

function defaultsettings() {
        return {

                "secret": "asdaksgdsahgdhsagd ahjsgdjhsg",

                "github": {
                        "CLIENT_ID": "",
                        "CLIENT_SECRET": "",
                        "CALLBACK": "http://localhost:8086/auth/github/callback",
                        "API": "https://api.github.com",
                        "RAW_URL": "https://raw.githubusercontent.com",
                        "URL": "https://github.com"
                },

                "appstore": {
                        "URL": ""
                },

                "registry": {
                        "URL": ""
                },

                "mongo": {
                        "URL": "mongodb://mongo:27017"
                },

                "redis": {
                        "host": "redis",
                        "port": 6379
                },

                "testserver": {
                        "URL": "http://localhost:9090"
                }

        };
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = initPassport;

var _passport = __webpack_require__(4);

var _passport2 = _interopRequireDefault(_passport);

var _passportGithub = __webpack_require__(16);

var _passportGithub2 = _interopRequireDefault(_passportGithub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GitHubStrategy = _passportGithub2.default.Strategy;

function initPassport(app, config) {
	var _config$github = config.github,
	    _config$github$CLIENT = _config$github.CLIENT_ID,
	    CLIENT_ID = _config$github$CLIENT === undefined ? "" : _config$github$CLIENT,
	    _config$github$CLIENT2 = _config$github.CLIENT_SECRET,
	    CLIENT_SECRET = _config$github$CLIENT2 === undefined ? "" : _config$github$CLIENT2,
	    _config$github$CALLBA = _config$github.CALLBACK,
	    CALLBACK = _config$github$CALLBA === undefined ? "" : _config$github$CALLBA;


	if (CLIENT_ID.trim() == "" || CLIENT_SECRET.trim() == "" || CALLBACK.trim() == "") {
		return;
	}

	console.log("initing passport");

	var User = __webpack_require__(17)(config.mongo.URL);

	app.use(_passport2.default.initialize());
	app.use(_passport2.default.session());

	_passport2.default.use(new GitHubStrategy({
		clientID: config.github.CLIENT_ID,
		clientSecret: config.github.CLIENT_SECRET,
		callbackURL: config.github.CALLBACK
	}, function (accessToken, refreshToken, profile, cb) {

		User.findOne({ githubId: profile.id }, function (err, user) {
			if (user == null) {
				var newuser = new User({ githubId: profile.id,
					username: profile.username,
					accessToken: accessToken,
					email: profile.email
				});
				newuser.save(function (err) {
					return cb(err, user);
				});
			} else {
				//MUST update here - incase the token has changed
				console.log("updating token");
				var conditions = { accessToken: accessToken };
				User.update({ githubId: profile.id }, { $set: { accessToken: accessToken } }, function (err, u) {
					console.log("done!!", u);
					return cb(null, user);
				});
			}
		});
	}));

	_passport2.default.serializeUser(function (user, done) {
		done(null, user._id);
	});

	_passport2.default.deserializeUser(function (id, done) {

		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
}

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("passport-github");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _mongoose = __webpack_require__(18);

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (url) {

	_mongoose2.default.connect(url + '/passport');

	return _mongoose2.default.model('User', {
		username: String,
		githubId: String,
		email: String,
		accessToken: String
	});
};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _passport = __webpack_require__(4);

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

//need to explicity log this user out 
router.get('/logout', function (req, res) {

	//var User = require('../models/user')(req.config.mongo.URL);

	//if (req.user){
	//	User.findOne({ username: req.user.username}).remove().exec();
	//}

	req.logout();
});

router.get('/github', _passport2.default.authenticate('github', { scope: 'public_repo' }));

router.get('/github/callback', _passport2.default.authenticate('github', { failureRedirect: '/auth/github' }), function (req, res) {
	console.log("callback success");
	res.redirect('/');
});

module.exports = router;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _superagent = __webpack_require__(5);

var _superagent2 = _interopRequireDefault(_superagent);

var _fs = __webpack_require__(1);

var _fs2 = _interopRequireDefault(_fs);

var _path = __webpack_require__(6);

var _path2 = _interopRequireDefault(_path);

var _docker = __webpack_require__(3);

var _docker2 = _interopRequireDefault(_docker);

var _utils = __webpack_require__(7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var router = _express2.default.Router();
var agent = _superagent2.default.agent();
var network = "bridge";

//TODO: check if container is tagged instead, as this is a less ambiguous way of retrieving the required container
var _fetchDockerIP = function _fetchDockerIP(containerName) {

	console.log('retrieving docker ip for container ' + containerName);

	return new Promise(function (resolve, reject) {
		_docker2.default.listContainers({}, function (err, containers) {
			if (err) {
				console.log("error listing containers!!");
				reject(containers);
			} else {
				var ip = containers.reduce(function (acc, c) {
					if (_name(c).indexOf(containerName) !== -1) {
						//console.log("found container!!!");
						return _addr(c);
					}
					return acc;
				}, "127.0.0.1");
				console.log("RETURNING IP", ip);
				resolve(ip);
			}
		});
	});
};

var _name = function _name(container) {
	try {
		if (container["Names"]) {
			return container["Names"][0].split("\/").slice(-1)[0];
		} else {
			return "";
		}
	} catch (err) {
		console.log("error getting name for container", container);
		return "";
	}
};

var _addr = function _addr(container) {
	//console.log("GETTING THE ADDRESS OF THE CONTAINER", JSON.stringify(container,null,4));
	//databox_databox-cm-app-server-net
	//ingress
	console.log("retrieving addr for", container);

	if (container.NetworkSettings && container.NetworkSettings.Networks && container.NetworkSettings.Networks[network]) {
		return container.NetworkSettings.Networks[network].IPAddress || "";
	}
	return "127.0.0.1";
};

var _createCommit = function _createCommit(config, user, repo, sha, filename, content, message, accessToken) {

	return new Promise(function (resolve, reject) {
		_superagent2.default.put(config.github.API + '/repos/' + user.username + '/' + repo + '/contents/' + filename).send({
			"message": message,
			"committer": {
				"name": user.username,
				"email": user.email || user.username + '@me-box.com'
			},
			"content": content,
			"sha": sha
		}).set('Authorization', 'token ' + accessToken).set('Accept', 'application/json').end(function (err, data) {
			if (err) {
				console.log("******** ERROR ********");
				console.log(err);
				reject(err);
			} else {
				//have found that it can still take time before this registers as the latest commit.
				resolve(data);
			}
		});
	});
};

var _createRepo = function _createRepo(config, user, name, description, flows, manifest, commitmessage, accessToken) {

	return new Promise(function (resolve, reject) {

		_superagent2.default.post(config.github.API + '/user/repos').send({
			"name": name,
			"description": description,
			"private": false,
			"has_issues": false,
			"has_wiki": false,
			"has_downloads": false
		}).set('Authorization', 'token ' + accessToken).set('Accept', 'application/json').end(function (err, data) {
			if (err) {
				console.log('am here error creating repo!');
				reject(err);
			} else {

				var result = data.body;

				console.log({
					name: result.name,
					updated: result.updated_at,
					icon: result.owner.avatar_url,
					url: result.url
				});

				//give github time it needs to set up repo

				setTimeout(function () {
					resolve({
						name: result.name,
						updated: result.updated_at,
						icon: result.owner.avatar_url,
						url: result.url
					});
				}, 2000);
			}
		});
	}).then(function (repo) {

		return Promise.all([Promise.resolve(repo), _addFile({
			config: config,
			username: user.username,
			repo: repo.name,
			filename: 'flows.json',
			email: user.email || user.username + '@me-box.com',
			message: commitmessage,
			content: new Buffer(JSON.stringify(flows)).toString('base64'),
			accessToken: accessToken
		})]);
	}, function (err) {
		console.log(err);
		res.status(500).send({ error: 'could not create repo' });
	}).then(function (values) {

		var repo = values[0];

		return Promise.all([Promise.resolve(repo.name), Promise.resolve(values[1]), _addFile({
			config: config,
			username: user.username,
			repo: repo.name,
			filename: 'manifest.json',
			email: user.email || user.username + '@me-box.com',
			message: commitmessage,
			content: new Buffer(JSON.stringify(manifest)).toString('base64'),
			accessToken: accessToken
		})]);
	});
};

var _addFile = function _addFile(options) {
	var config = options.config,
	    username = options.username,
	    repo = options.repo,
	    filename = options.filename,
	    message = options.message,
	    email = options.email,
	    content = options.content,
	    accessToken = options.accessToken;


	return new Promise(function (resolve, reject) {
		_superagent2.default.put(config.github.API + '/repos/' + username + '/' + repo + '/contents/' + filename).send({
			"message": message,
			"committer": {
				"name": username,
				"email": email
			},
			"content": content
		}).set('Authorization', 'token ' + accessToken).set('Accept', 'application/json').end(function (err, res) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				console.log(res.body);
				resolve(Object.assign({}, res.body, { repo: repo }));
			}
		});
	});
};

var _fetchFile = function _fetchFile(config, username, repoowner, accessToken, repo, filename) {

	console.log('{fetching file: ' + filename);

	return new Promise(function (resolve, reject) {
		_superagent2.default.get(config.github.API + '/repos/' + repoowner + '/' + repo + '/contents/' + filename).set('Accept', 'application/json').set('Authorization', 'token ' + accessToken).end(function (err, data) {
			if (err || !data.ok) {
				reject(err);
			} else {

				//only send back sha (used for future updates) if user that requested this repo is the owner
				var jsonstr = new Buffer(data.body.content, 'base64').toString('ascii');
				try {
					if (username === repoowner) {
						resolve({ content: JSON.parse(jsonstr), sha: data.body.sha });
					} else {
						resolve({ content: JSON.parse(jsonstr) });
					}
				} catch (error) {
					console.log("error parsing JSON");
					console.log(error);
					console.log(jsonstr);
					resolve({ content: {} });
				}
			}
		});
	});
};

var _wait = function _wait(storeurl) {
	return new Promise(function (resolve, reject) {
		function get() {
			console.log('calling ' + storeurl);
			agent.get('http://' + storeurl, function (error, response, body) {
				if (error) {
					console.log("[seeding manifest] waiting for appstore", error);
					setTimeout(get, 4000);
				} else {
					resolve();
				}
			});
		}
		setTimeout(get, 2000);
	});
};

var _saveToAppStore = function _saveToAppStore(config, manifest) {
	console.log("saving to app store with manifest", manifest);

	//if no appstore url specified, assume a dockerised one running and retrieve docker ip
	if (!config.appstore || (config.appstore.URL || "").trim() === "") {
		console.log("fetching docker ip for databox_app-server");
		return _fetchDockerIP("databox_app-server").then(function (ip) {
			console.log("url to post to:", ip);
			return _postToAppStore(ip + ':8181', manifest);
		});
	} else {
		return _postToAppStore('' + config.appstore.URL, manifest);
	}
};

var _postToAppStore = function _postToAppStore(storeurl, manifest) {

	console.log("POSTING TO APP STORE", storeurl + '/app/post');
	return _wait(storeurl).then(function () {
		return new Promise(function (resolve, reject) {
			agent.post('http://' + storeurl + '/app/post').send(manifest).set('Accept', 'application/json').type('form').end(function (err, res) {
				if (err) {
					console.log("error posting to app store", err);
					reject(err);
				} else {
					console.log("DONE!");
					console.log(res.body);
					resolve(res.body);
				}
			});
		});
	});
};

var _generateManifest = function _generateManifest(config, user, reponame, app, packages, allowed) {

	var appname = app.name.startsWith(user.username) ? app.name : user.username + '-' + app.name;

	return {
		'manifest-version': 1,
		name: appname,
		version: "0.1.0",
		description: app.description,
		author: user.username,
		licence: "MIT",
		"databox-type": "app",
		tags: app.tags ? app.tags.split(",") : "",
		homepage: config.github.URL + '/' + user.username + '/' + reponame,
		repository: {
			type: 'git',
			url: 'git+' + config.github.URL + '/' + user.username + '/' + reponame + '.git'
		},
		packages: packages.map(function (pkg) {
			return {
				id: pkg.id,
				name: pkg.name,
				purpose: pkg.purpose,
				required: pkg.install === "compulsory",
				datastores: Array.from(new Set([].concat(_toConsumableArray(pkg.datastores.map(function (d) {
					return d.id;
				}))))),
				risk: pkg.risk,
				benefits: pkg.benefits
			};
		}),

		'allowed-combinations': allowed,

		datasources: (0, _utils.flatten)(packages.map(function (pkg) {
			return pkg.datastores.map(function (d) {
				return {
					type: d.type,
					required: true,
					name: d.name || d.type,
					clientid: d.id,
					granularities: []
				};
			});
		})),

		"network-permissions": [],

		"resource-requirements": {},

		volumes: []
	};
};

var _publish = function _publish(config, user, reponame, app, packages, libraries, allowed, flows) {

	console.log("PUBLISHING NOW WITH LIBRARIES");
	console.log(libraries);

	return new Promise(function (resolve, reject) {
		//create a new docker file


		var libcommands = libraries.map(function (library) {
			return 'RUN cd /data/nodes/databox && npm install --save ' + library;
		});

		//add a echo statement to force it not to cache (nocache option in build doesn't seem to work
		var dcommands = ['FROM tlodge/databox-sdk-red:latest', 'ADD flows.json /data/flows.json', 'LABEL databox.type="app"', 'LABEL databox.manifestURL="' + config.appstore.URL + '/' + app.name + '/manifest.json"'];

		var startcommands = ["EXPOSE 8080", "CMD /root/start.sh"];

		var dockerfile = [].concat(dcommands, _toConsumableArray(libcommands), startcommands).join("\n");

		console.log("-->building with dockerfile");
		console.log(dockerfile);

		var manifest = _generateManifest(config, user, app.name, app, packages, allowed);
		console.log("generated manifest");
		console.log(manifest);

		var data = {
			manifest: JSON.stringify(manifest),

			poster: JSON.stringify({
				username: user.username
			}),

			postDate: JSON.stringify(new Date().toISOString()),

			queries: JSON.stringify(0)
		};

		console.log("saving to app store");
		console.log(data);

		return _saveToAppStore(config, data).then(function (result) {
			var path = user.username + '-tmp.tar.gz';
			return (0, _utils.createTarFile)(dockerfile, flows, path);
		}, function (err) {
			reject("could not save to app store!");
		}).then(function (tarfile) {

			var appname = app.name.startsWith(user.username) ? app.name.toLowerCase() : user.username.toLowerCase() + '-' + app.name.toLowerCase();
			//${config.registry.URL}/
			return (0, _utils.createDockerImage)(tarfile, '' + appname);
		}, function (err) {
			reject("could not create tar file");
		}).then(function (tag) {
			return (0, _utils.uploadImageToRegistry)(tag, '' + config.registry.URL);
		}, function (err) {
			reject('could not create docker image');
		}).then(function () {
			resolve();
		}, function (err) {
			reject('could not upload to registry');
		});
	});
};

//list all apps owned by this user
router.get('/repos/:user', function (req, res) {
	var user = req.user;
	var username = req.params.user;

	//set to this user if passed in empty string or no user
	if (!username || username.trim() === "") {
		username = req.user.username;
	}
	_superagent2.default.get(req.config.github.API + '/users/' + username + '/repos').set('Accept', 'application/json').set('Authorization', 'token ' + req.user.accessToken).end(function (err, data) {
		if (err) {
			console.log(err);
			res.status(500).send({ error: 'could not retrieve repos' });
		} else {
			var repos = data.body.map(function (repo) {
				return {
					name: repo.name,
					description: repo.description,
					updated: repo.updated_at,
					icon: repo.owner.avatar_url,
					url: repo.url
				};
			}).filter(function (repo) {
				return repo.name.startsWith("databox.");
			});

			res.send({ username: username, repos: repos });
		}
	});
});

//list all apps owned by this user
router.get('/repos', function (req, res) {
	console.log("getting repos with accessToken", req.user.accessToken);
	var user = req.user;

	_superagent2.default.get(req.config.github.API + '/users/' + user.username + '/repos').query({ 'per_page': 100, sort: 'created', direction: 'desc' }).set('Accept', 'application/json').set('Authorization', 'token ' + req.user.accessToken).end(function (err, data) {
		if (err) {
			console.log(err);
			req.logout();
			res.status(500).send({ error: 'could not retrieve repos' });
		} else {
			var repos = data.body.map(function (repo) {

				return {
					name: repo.name,
					description: repo.description,
					updated: repo.updated_at,
					icon: repo.owner.avatar_url,
					url: repo.url
				};
			}).filter(function (repo) {
				return repo.name.startsWith("databox.");
			});

			res.send({ username: req.user.username, repos: repos });
		}
	});
});

//load up an app from a repo
router.get('/flow', function (req, res) {

	var user = req.user;
	var repo = req.query.repo;
	var owner = req.query.username || user.username;

	return Promise.all([_fetchFile(req.config, user.username, owner, user.accessToken, repo, 'flows.json'), _fetchFile(req.config, user.username, owner, user.accessToken, repo, 'manifest.json')]).then(function (values) {

		res.send({
			result: 'success',
			flows: values[0],
			manifest: values[1]
		});
	}, function (err) {
		console.log(err);
		res.status(500).send({ error: 'could not retrieve flows and manifest file' });
	});
});

//create a new 'app' (i.e a github repo prefixed with 'databox.').  Will also create a new  flows.json / manifest.json file.

router.post('/repo/new', function (req, res) {

	var user = req.user;
	var name = req.body.name.startsWith("databox.") ? req.body.name.toLowerCase() : 'databox.' + req.body.name.toLowerCase();
	var description = req.body.description || "";
	var flows = req.body.flows || [];
	var manifest = req.body.manifest || {};
	var commitmessage = req.body.message || "first commit";

	return _createRepo(req.config, user, name, description, flows, manifest, commitmessage, req.user.accessToken).then(function (repo) {
		return repo;
	}).then(function (values) {
		res.send({
			result: 'success',
			repo: values[0],
			sha: {
				flows: values[1].content.sha,
				manifest: values[2].content.sha
			}
		});
	}, function (err) {
		console.log(err);
		res.status(500).send({ error: 'could not create files' });
	});
});

router.post('/repo/update', function (req, res) {

	var user = req.user;
	var repo = req.body.repo;
	var flowscontent = new Buffer(JSON.stringify(req.body.flows)).toString('base64');
	var manifestcontent = new Buffer(JSON.stringify(req.body.manifest)).toString('base64');
	var sha = req.body.sha;
	var message = req.body.message || "checkpoint commit";

	return _createCommit(req.config, user, repo, sha.flows, 'flows.json', flowscontent, message, user.accessToken).then(function (data) {
		return Promise.all([Promise.resolve(data.body.content.sha), _createCommit(req.config, user, repo, sha.manifest, 'manifest.json', manifestcontent, message, user.accessToken)]);
	}, function (err) {
		res.status(500).send({ error: err });
	}).then(function (values) {

		res.send({
			result: 'success',
			repo: repo,
			sha: {
				flows: values[0],
				manifest: values[1].body.content.sha
			}
		});
	}, function (err) {
		console.log(err);
		res.status(500).send({ error: 'could not update the repo' });
	});
});

router.post('/publish', function (req, res) {

	var user = req.user;
	var repo = req.body.repo;
	var manifest = req.body.manifest;
	var flows = req.body.flows;

	var app = manifest.app;
	var packages = manifest.packages;
	var allowed = manifest['allowed-combinations'];
	var description = manifest.app.description;
	var commitmessage = 'publish commit';

	//first save the manifest and flows file - either create new repo or commit changes

	var libraries = (0, _utils.dedup)((0, _utils.flatten)(flows.reduce(function (acc, node) {
		if (node.type === "dbfunction") {
			acc = [].concat(_toConsumableArray(acc), [(0, _utils.matchLibraries)(node.func)]);
		}
		return acc;
	}, [])));

	if (repo && repo.sha && repo.sha.flows && repo.sha.manifest) {
		//commit

		console.log("COMMITTING!!!");
		var flowcontent = new Buffer(JSON.stringify(flows)).toString('base64');
		var manifestcontent = new Buffer(JSON.stringify(manifest)).toString('base64');
		var message = commitmessage;

		return _createCommit(req.config, user, repo.name, repo.sha.flows, 'flows.json', flowcontent, message, req.user.accessToken).then(function (data) {
			return Promise.all([Promise.resolve(data.body.content.sha), _createCommit(req.config, user, repo.name, repo.sha.manifest, 'manifest.json', manifestcontent, message, req.user.accessToken)]);
		}, function (err) {
			res.status(500).send({ error: err });
		}).then(function (values) {
			return Promise.all([Promise.resolve(values[0]), Promise.resolve(values[1].body.content.sha), _publish(req.config, user, repo.name, app, packages, libraries, allowed, JSON.stringify(flows))]);
		}, function (err) {
			res.status(500).send({ error: err });
		}).then(function (values) {
			res.send({
				result: 'success',
				repo: repo.name,
				sha: {
					flows: values[0],
					manifest: values[1]
				}
			});
		});
	} else {
		//create a new repo!
		console.log("CREATING NEW REPO..");
		var reponame = app.name.startsWith("databox.") ? app.name.toLowerCase() : 'databox.' + app.name.toLowerCase();
		console.log(reponame);
		return _createRepo(req.config, user, reponame, app.description, flows, manifest, commitmessage, req.user.accessToken).then(function (values) {
			console.log('publishing...' + reponame);
			return Promise.all([Promise.resolve(values), _publish(req.config, user, reponame, app, packages, libraries, allowed, JSON.stringify(flows))]);
		}, function (err) {
			res.status(500).send({ error: err });
		}).then(function (values) {
			var repodetails = values[0];
			console.log("SENDING SUCCESS RESPONSE!");
			res.send({
				result: 'success',
				repo: repodetails[0],
				sha: {
					flows: repodetails[1].content.sha,
					manifest: repodetails[2].content.sha
				}
			});
		});
	}
});

module.exports = router;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("dockerode");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("zlib");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("tar-stream");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _superagent = __webpack_require__(5);

var _superagent2 = _interopRequireDefault(_superagent);

var _docker = __webpack_require__(3);

var _docker2 = _interopRequireDefault(_docker);

var _utils = __webpack_require__(7);

var _minimist = __webpack_require__(2);

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var router = _express2.default.Router();

var argv = (0, _minimist2.default)(process.argv.slice(2));
var DEVMODE = argv.dev || false;
var network = "bridge";

var _postFlows = function _postFlows(ip, port, data, username) {
	console.log('connecting to ' + ip + ':' + port + '/flows');

	//add in channelIDs here
	var flows = data.map(function (node) {
		var outputtypes = ["app", "debugger", "bulbsout", "pipstaprint"];
		var modifier = outputtypes.indexOf(node.type) != -1 ? { appId: username } : {}; //inject the appID
		return Object.assign({}, node, modifier);
	});
	//REMOVE THIS TO -- PUT IN TO TEST!
	//port = 1880;
	console.log("flows:", JSON.stringify(flows, null, 4));
	return new Promise(function (resolve, reject) {
		_superagent2.default.post(ip + ':' + port + '/flows').send(flows).set('Accept', 'application/json').type('json').end(function (err, result) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				console.log("successfully installed new flows");
				resolve(true);
			}
		});
	});
};

/*  after a container has started it'll take a bit of time initing, after which we need to send it a flow file
    the only way I can think of to be sure it is ready to receive this is to monitor the container stdout and
    look for "Started Flows", and send the flow file a second after this */
var _waitForStart = function _waitForStart(container) {
	return new Promise(function (resolve, reject) {
		container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
			stream.on('data', function (line) {
				if (line.toString().indexOf("Started flows") != -1) {
					console.log("started container");
					setTimeout(function () {
						console.log("sending flows");
						resolve(true);
					}, 1000);
				}
			});
		});
	});
};

var _pullContainer = function _pullContainer(name) {
	console.log("pulling container", name);

	return _docker2.default.pull(name).then(function (stream, err) {
		return new Promise(function (resolve, reject) {
			if (err) {
				console.log("error pulling container!", err);
				reject(err);
			}
			return _docker2.default.modem.followProgress(stream, function () {
				console.log("successfully pulled container");resolve();
			}, function (event) {
				console.log(event);
			});
		});
	});
};

var _fetchAddr = function _fetchAddr(cdata) {
	if (DEVMODE) {
		return {
			ip: "127.0.0.1",
			port: cdata['NetworkSettings']['Ports']['1880/tcp'][0]['HostPort']
		};
	}
	return {
		ip: cdata.NetworkSettings.Networks[network].IPAddress,
		port: 1880
	};
};

var _fetchRunningAddr = function _fetchRunningAddr(c) {
	console.log("FETCHING RUNNING ADDR");

	if (DEVMODE) {
		console.log("in dev mode!");
		return {

			ip: "127.0.0.1",

			port: c.Ports.reduce(function (acc, obj) {
				if (obj.PrivatePort == 1880) acc = obj.PublicPort;
				return acc;
			}, 0)
		};
	}
	console.log("ok getting ip, port from", c);

	return {
		ip: c.NetworkSettings.Networks[network].IPAddress,
		port: c.Ports[0].PrivatePort
	};
};

var _inspect = function _inspect(container) {
	return new Promise(function (resolve, reject) {
		container.inspect(function (err, cdata) {
			if (err) {
				reject(err);
			} else {
				resolve(cdata);
			}
		});
	});
};

var _startContainer = function _startContainer(container, flows, username) {
	return _waitForStart(container).then(function () {
		return _inspect(container);
	}).then(function (cdata) {
		console.log("starting container, devmode is ", DEVMODE);

		var _fetchAddr2 = _fetchAddr(cdata),
		    ip = _fetchAddr2.ip,
		    port = _fetchAddr2.port;

		return _postFlows(ip, port, flows, username);
	}, function (err) {
		console.log(err);
		throw err;
	});
};

var _createNewImageAndContainer = function _createNewImageAndContainer(libraries, username, flows) {
	//need to create a new Image!
	console.log("found external libraries, so creating new image!");

	var libcommands = libraries.map(function (library) {
		return 'RUN cd /data/nodes/databox && npm install --save ' + library;
	});

	var dcommands = ['FROM tlodge/databox-red', 'ADD flows.json /data/flows.json'].concat(_toConsumableArray(libcommands));
	var dockerfile = dcommands.join("\n");

	console.log(dockerfile);

	var path = 'tmp-' + username + '.tar.gz';

	return _pullContainer("tlodge/databox-red:latest").then(function () {
		return (0, _utils.stopAndRemoveContainer)(username + '-red');
	}).then(function () {
		return (0, _utils.createTarFile)(dockerfile, JSON.stringify(flows), path);
	}).then(function (tarfile) {
		console.log('created tar file ' + tarfile);
		return (0, _utils.createDockerImage)(tarfile, username + '-testimage');
	}).then(function (image) {
		console.log("creating test container!");
		return (0, _utils.createTestContainer)(image, username, network);
	}).then(function (container) {
		console.log("successfully created container");
		return _startContainer(container, flows, username);
	});
};

/*var _name = function(container){
	if (container["Names"]){
		return container["Names"][0].split("\/").slice(-1)[0];
	}
}

var _addr = function(container){
	if (container.NetworkSettings && container.NetworkSettings.Networks && container.NetworkSettings.Networks.bridge){
		return container.NetworkSettings.Networks.bridge.IPAddress || "";
	}
	return "";
}

var _ports = function(container){
	return (container.Ports || []).reduce((acc, obj)=>{
		if (obj.PublicPort){
			acc.push(obj.PublicPort);
		}
		return acc;
	},[]);
}*/

var _listContainers = function _listContainers() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return new Promise(function (resolve, reject) {
		_docker2.default.listContainers(options, function (err, containers) {
			if (err) {
				reject(containers);
			} else {
				resolve(containers);

				/*.map((c)=>{
    	return {
    		id: c["Id"],
    		name: _name(c),  
    		status: c["Status"],
    		state: c["State"],
    		ip: _addr(c),
    		ports: _ports(c)
    	}
    }));*/
			}
		});
	});
};

var _restart = function _restart(container) {
	return new Promise(function (resolve, reject) {
		container.restart({}, function (err, data) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

var _createContainerFromStandardImage = function _createContainerFromStandardImage(username, flows) {

	var opts = {
		filters: {
			label: ['user=' + username],
			status: ['running', "exited"]
		}
	};

	return _listContainers(opts).then(function (containers) {
		return containers;
	}, function (err) {
		return err;
	}).then(function (containers) {
		console.log('Containers labeled user=' + username + ' ' + containers.length);

		//create a new container and start it, if it doesn't exist
		if (containers.length <= 0) {
			console.log("OK - creating test container....");
			return _pullContainer("tlodge/databox-red:latest").then(function () {
				return (0, _utils.createTestContainer)('tlodge/databox-red', username, network);
			}).then(function (container) {
				return _startContainer(container, flows, username);
			});
		} else {
			var c = containers[0];
			//restart the container if it exists but is stopped
			if (c.State === 'exited') {
				console.log("restarting container!!");
				var container = _docker2.default.getContainer(c.Id);
				return _restart(container).then(function (cdata) {
					return _startContainer(container, flows, username);
				}, function (err) {
					return err;
				});
			} else {
				console.log("container already ruinning...");
				console.log(c);

				var _fetchRunningAddr2 = _fetchRunningAddr(c),
				    ip = _fetchRunningAddr2.ip,
				    port = _fetchRunningAddr2.port;

				console.log("posting new flows to", ip, port);
				return _postFlows(ip, port, flows, username);
			}
		}
	});
};

router.post('/flows', function (req, res) {

	var flows = req.body;

	var libraries = (0, _utils.dedup)((0, _utils.flatten)(req.body.reduce(function (acc, node) {
		if (node.type === "dbfunction") {
			acc = [].concat(_toConsumableArray(acc), [(0, _utils.matchLibraries)(node.func)]);
		}
		return acc;
	}, [])));

	if (libraries.length > 0) {
		console.log("CREATING NEW IMAGE AND CONTAINER!!");
		return _createNewImageAndContainer(libraries, req.user.username, flows).then(function (result) {
			res.send({ success: true });
		}, function (err) {
			res.status(500).send({ error: err });
		});
	} else {
		console.log("CREATING CONTAINER FROM STANDARD IMAGE!");
		return _createContainerFromStandardImage(req.user.username, flows).then(function (result) {
			res.send({ success: true });
		}, function (err) {
			res.status(500).send({ error: err });
		});
	}
});

module.exports = router;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _fs = __webpack_require__(1);

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/:sensor', function (req, res) {

	var sensor = req.params.sensor;
	console.log("received request for sensor");
	console.log(sensor);

	if (!sensor) {
		res.send({ success: false, error: "no sensor provided" });
		return;
	}

	var valid = /^[a-zA-Z]+$/.test(sensor);

	if (!valid) {
		console.log("invalid sensor requested!");
		res.send({ success: false, error: "invalid sensor type" });
		return;
	}

	_fs2.default.readFile('./static/samples/' + sensor + '.json', 'utf8', function (err, data) {
		if (err) {
			console.log(err);
			res.send({ success: false, error: err });
			return;
		}
		try {

			res.send({ success: true, data: JSON.parse(data) });
			return;
		} catch (err) {
			console.log(err);
			res.send({ success: false, error: "failed to read sensor data" });
			return;
		}
	});
});

module.exports = router;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _express = __webpack_require__(0);

var _express2 = _interopRequireDefault(_express);

var _fs = __webpack_require__(1);

var _fs2 = _interopRequireDefault(_fs);

var _path = __webpack_require__(6);

var _path2 = _interopRequireDefault(_path);

var _minimist = __webpack_require__(2);

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = __webpack_require__(27);
Promise.promisifyAll(_fs2.default);
var argv = (0, _minimist2.default)(process.argv.slice(2));
var router = _express2.default.Router();

var ROOTDIR = argv.dev ? _path2.default.join(__dirname, '../static/uibuilder/') : _path2.default.join(__dirname, '/static/uibuilder/');

router.post('/scene/add', function (req, res) {
  var DIRECTORY = _path2.default.join(ROOTDIR, '/scenes/');

  var _req$body = req.body,
      name = _req$body.name,
      scene = _req$body.scene;


  var ts = Date.now();
  var filename = _path2.default.join(DIRECTORY, ts + '_' + name + '.scene');

  _fs2.default.writeFileAsync(filename, scene).then(function () {
    res.send({ success: true });
  }, function (err) {
    res.send({ success: false });
  });
});

router.get('/scenes/:name', function (req, res) {
  res.sendFile(_path2.default.join(ROOTDIR, '/scenes/' + req.params.name));
});

router.get('/scenes/', function (req, res) {
  _fs2.default.readdir(_path2.default.join(ROOTDIR, '/scenes/'), function (err, files) {

    files = files || [];

    var scenes = files.filter(function (fileName) {
      return fileName.indexOf(".scene") != -1;
    });

    /*const scenes = images.map((fileName)=>{
       
         const f = path.join(__dirname, `./src/client/assets/images/${fileName}`);
       
        var contents = fs.readFileSync(f, 'utf8');
        
        return {
            image: fileName,
            body: contents,
        }
    });*/

    res.send(scenes);
  });
});

//just dev, so blocking read of images dir
router.get('/images/', function (req, res) {

  console.log("reading images from ", _path2.default.join(ROOTDIR, '/images/'));

  _fs2.default.readdir(_path2.default.join(ROOTDIR, '/images/'), function (err, files) {

    if (!files || err) {
      console.log(err);
      res.send([]);
      return;
    }

    var images = files.filter(function (fileName) {
      return fileName.indexOf(".svg") != -1;
    });

    var data = images.map(function (fileName) {

      var f = _path2.default.join(ROOTDIR, '/images/' + fileName);

      var contents = _fs2.default.readFileSync(f, 'utf8');

      return {
        image: fileName,
        body: contents
      };
    });
    console.log("sending data", data);
    res.send(data);
  });
});

router.get('/images/:name', function (req, res) {
  res.sendFile(_path2.default.join(ROOTDIR, '/images/' + req.params.name));
});

router.post('/image/add', function (req, res) {

  var DIRECTORY = _path2.default.join(ROOTDIR, '/images/');

  var _req$body2 = req.body,
      name = _req$body2.name,
      image = _req$body2.image;

  //var data = image.replace(/^data:image\/\w+;base64,/, "");
  //var buf = new Buffer(data, 'base64');

  var filename = _path2.default.join(DIRECTORY, name);

  _fs2.default.writeFileAsync(filename, image).then(function () {
    res.send({ success: true });
  }, function (err) {
    console.log(err);
    res.send({ success: false });
  });
});

module.exports = router;

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("ejs");

/***/ })
/******/ ]);