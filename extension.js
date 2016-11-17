/**
 * An Openframe extension which loops through a users collection on a timed interval.
 */

var pjson = require('./package.json'),
    debug = require('debug')('openframe:slideshow'),
    Extension = require('openframe-extension');

// default interval in minutes
// TODO: for wider release a longer default interval is probably better
var DEFAULT_INTERVAL = 1;

/**
 * Extension initialization method.
 *
 * Called when the extension (and its dependencies) have been installed.
 *
 * @param  {object} OF An interface provided to extensions giving limitted access to the frame environment
 */
module.exports = new Extension({
    init: function(OF) {
        // do your extension thing
        debug('=======>   Openframe-Slideshow initialized!   <=======');
        /**
         * Extensions also have access to the global event system
         */
        var pubsub = this.pubsub;

        /**
         * Extensions also have access to the Swagger REST client (https://github.com/swagger-api/swagger-js)
         * See openframe.io/explorer for API docs, or openframe.io/explorer/swagger.json for the swagger definition
         * which shows the available methods as 'operationId'
         */
        var rest = this.rest;

        /**
         * Reference to the frame model wrapper, allowing plugin to update frame data.
         * (frame.state is the model data)
         */
        var frame = this.frame;

        // used to debounce requests... don't make more than one request at a time
        var fetching = false;
        var interval;

        // if set for frame, use interval
        if (frame.state.settings && frame.state.settings[pjson.name] && frame.state.settings[pjson.name].interval) {
            interval = minToMillis(frame.state.settings[pjson.name].interval);
        } else {
            interval = minToMillis(DEFAULT_INTERVAL);
        }

        debug('interval', interval);

        var timer = setInterval(getNextFromCollection, interval);

        /**
         * Use the REST API to fetch the collection, then select a random artwork to display.
         */
        function getNextFromCollection() {
            debug('getNextFromCollection', interval);

            fetching = true;
            // get the logged-in user's primary collection
            rest.OpenframeUser.OpenframeUser_prototype_primary_collection({
                id: 'current'
            }).then(function(data) {
                // the list of artwork from the collection
                var artworkList = data.obj.collection.artwork,
                    len = artworkList.length,
                    currentArtworkId = frame.state._current_artwork && frame.state._current_artwork.id,
                    nextArtwork;

                debug('currentArtworkId', currentArtworkId);

                // cur idx
                var idx = artworkList.findIndex(function(el) {
                    return currentArtworkId === el.id;
                });

                debug('idx', idx);

                idx = idx === -1 ? 0 : idx;

                // next idx
                if (idx < len - 2) {
                    idx += 1;
                } else {
                    idx = 0;
                }

                nextArtwork = artworkList[idx];

                // frame.state is the plain JS object representing the frame's state...
                // set the _current_artwork to be the randomArtwork
                frame.state._current_artwork = nextArtwork;

                // then save the frame to the server. when the db is updated on the server, the server
                // will trigger a 'frame updated' event, which will in turn update this frame, forcing
                // the artwork to change to the new one we just set
                frame.save()
                    .then(function() {
                        debug('Success...');
                        fetching = false;
                    })
                    .catch(function(err) {
                        debug('ERROR: ', err);
                    });
            }).catch(function(err) {
                debug('ERROR: ', err);
            });
        }

        function minToMillis(min) {
            return min * 60000;
        }
    }
});
