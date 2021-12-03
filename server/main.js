import { Meteor } from 'meteor/meteor';
import { UsersCursorsStream } from "/imports/api/streams/user_cursors_stream";


UsersCursorsStream.on('new_user', function() {
    console.log('new user... ', this.subscriptionId)
    this.onDisconnect = () => {
        const id = this.subscriptionId;
        onDisconnectCallback(id);
    }
    UsersCursorsStream.emit('new_user', this.subscriptionId);
});

const onDisconnectCallback = function(subscriptionId) {
    console.log("onDisconnectCallback", subscriptionId);
    UsersCursorsStream.emit('disconnected', subscriptionId)
};

Meteor.startup(() => {
    //allow any connected client to listen on the stream
    UsersCursorsStream.permissions.read(function(userId, eventName) {
        return true;
    });

    UsersCursorsStream.permissions.write(function(eventName) {
        return true;
    });
});