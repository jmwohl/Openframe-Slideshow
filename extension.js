/**
 * An Openframe extension which loops through a users collection on a timed duration.
 */

var pjson = require('./package.json'),
    debug = require('debug')('openframe:slideshow'),
    Extension = require('openframe-extension');

// default duration in minutes
var DEFAULT_DURATION = 1;

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

        var duration = getDuration(frame.state, frame.state.current_artwork);
        debug('duration', duration);

        var timer = setTimeout(getNextFromCollection, duration);

        /**
         * Use the REST API to fetch the collection, then select a random artwork to display.
         */
        function getNextFromCollection() {
            debug('getNextFromCollection', duration);

            // get the logged-in user's primary collection
            rest.OpenframeUser.OpenframeUser_prototype_get_created_artwork({
                id: 'current'
            }).then(function(data) {
                console.log(data);
                var artworkList = data.obj,
                    len = artworkList.length,
                    currentArtworkId = frame.state.current_artwork && frame.state.current_artwork.id,
                    nextArtwork;

                debug('currentArtworkId', currentArtworkId);

                // cur idx
                var idx = artworkList.findIndex(function(el) {
                    return currentArtworkId === el.id;
                });

                debug('idx', idx);

                idx = idx === -1 ? 0 : idx;

                // next idx
                if (idx < len - 1) {
                    idx += 1;
                } else {
                    idx = 0;
                }

                nextArtwork = artworkList[idx];
                debug('nextArtwork', nextArtwork);

                // allow artwork-specific durations
                var duration = getDuration(frame.state, nextArtwork);
                debug('duration', duration);

                // frame.state is the plain JS object representing the frame's state...
                frame.state.currentArtworkId = nextArtwork.id;

                // then save the frame to the server. when the db is updated on the server, the server
                // will trigger a 'frame updated' event, which will in turn update this frame, forcing
                // the artwork to change to the new one we just set
                frame.save()
                    .then(function() {
                        debug('Success...');
                        timer = setTimeout(getNextFromCollection, duration);
                    })
                    .catch(function(err) {
                        debug('ERROR: ', err);
                    });
            }).catch(function(err) {
                debug('ERROR: ', err);
            });
        }

        function getDuration(frameState, artwork) {
            var duration;
            if (artwork.settings && artwork.settings[pjson.name] && artwork.settings[pjson.name].duration) {
                duration = minToMillis(artwork.settings[pjson.name].duration);
            } else if (frameState.settings && frameState.settings[pjson.name] && frameState.settings[pjson.name].duration) {
                duration = minToMillis(frameState.settings[pjson.name].duration);
            } else {
                duration = minToMillis(DEFAULT_DURATION);
            }
            return duration;
        }

        function minToMillis(min) {
            return min * 60000;
        }
    }
});
