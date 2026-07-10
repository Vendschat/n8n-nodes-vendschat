const { VendsChatNewMessageTrigger } = require('./dist/nodes/VendsChatNewMessage/VendsChatNewMessageTrigger.node');
const { VendsChatSendMessage } = require('./dist/nodes/VendsChatSendMessage/VendsChatSendMessage.node');

module.exports = {
	nodes: [VendsChatNewMessageTrigger, VendsChatSendMessage],
};
