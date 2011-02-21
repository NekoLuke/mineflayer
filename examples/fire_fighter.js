
mf.include("navigator.js");
mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("arrays.js");

var fire_fighter;
if (fire_fighter === undefined) {
    fire_fighter = function() {
        var _public = {};
        _public.fightFire = function() {
            mf.chat("looking for fire");
            var nearest_fire_positions = block_finder.findNearest(mf.self().position, mf.ItemType.Fire, 64, Infinity);
            if (nearest_fire_positions.length === 0) {
                mf.chat("no fire within 64 meters");
                return;
            }
            var nearest_fire_position = nearest_fire_positions[0];
            mf.chat("found " + nearest_fire_positions.length + " fire" + (nearest_fire_positions.length === 0 ? "" : "s"));
            function arrived() {
                var punch_these = [
                    nearest_fire_position.offset( 1,  0,  0),
                    nearest_fire_position.offset(-1,  0,  0),
                    nearest_fire_position.offset( 0,  1,  0),
                    nearest_fire_position.offset( 0, -1,  0),
                    nearest_fire_position.offset( 0,  0,  1),
                    nearest_fire_position.offset( 0,  0, -1),
                ].filtered(function(point) { return mf.isDiggable(mf.blockAt(point).type); });
                var i = 0;
                function punch_next(reason) {
                    if (i < punch_these.length) {
                        var punch_this = punch_these[i];
                        mf.lookAt(punch_this);
                        mf.startDigging(punch_this);
                        i++;
                    } else {
                        mf.chat("done");
                        mf.removeHandler(mf.onStoppedDigging, punch_next);
                    }
                }
                mf.onStoppedDigging(punch_next);
                punch_next();
            }
            var distance_to_fire = mf.self().position.distanceTo(nearest_fire_position);
            var give_up_threshold = distance_to_fire * distance_to_fire;
            navigator.navigateTo(nearest_fire_position, {
                "arrived_func": arrived,
                "end_radius": 5,
                "give_up_threshold": give_up_threshold,
            });
        };
        chat_commands.registerCommand("fightfire", _public.fightFire);
        return _public;
    }();
}
